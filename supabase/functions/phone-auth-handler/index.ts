// Follow Deno Deploy edge function format
import { createClient } from 'npm:@supabase/supabase-js';
import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Resend with API key
const resend = new Resend('re_7oEonjYv_LzbjggsA4BhmVZeuPy3uDreu');

// Pre-configured test phone numbers and their verification codes
const TEST_PHONES = {
  '+8613138607996': '123456'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, code, action, channel = 'sms', userData } = await req.json();

    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      'https://ehvdxtyoctgkrgrabfij.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTkyNTgsImV4cCI6MjA2MjQ5NTI1OH0.2-dNzfXFO0AKpcWmRQM0svOBCQQ7SBTH5U7ABMYifq8',
      { auth: { persistSession: false } }
    );

    // For test phone numbers, we'll bypass the actual verification
    const isTestPhone = Object.keys(TEST_PHONES).includes(phone);

    if (action === 'verify') {
      if (!code) {
        throw new Error('Verification code is required');
      }

      // For test phones, check against our predefined codes
      if (isTestPhone) {
        if (code === TEST_PHONES[phone]) {
          // Create or get user
          const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByPhone(phone);
          
          if (userError && userError.message !== 'User not found') {
            throw userError;
          }
          
          // If user doesn't exist, create one
          if (!userData?.user) {
            const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
              phone,
              phone_confirm: true,
              user_metadata: {
                is_test_account: true,
                ...userData
              }
            });
            
            if (createError) throw createError;
            
            // Create a profile for the new user
            if (newUser?.user) {
              const { error: profileError } = await supabaseClient
                .from('profiles')
                .insert({
                  user_id: newUser.user.id,
                  username: `user_${phone.replace(/\+/g, '')}`,
                  full_name: `Test User (${phone})`,
                  type: 'doctor',
                  specialty: 'General Practice',
                  is_public: true
                });
                
              if (profileError) throw profileError;
            }
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Phone verified successfully' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('Invalid verification code');
        }
      } else {
        // For real phones, use the appropriate channel
        if (channel === 'whatsapp') {
          try {
            // Call our WhatsApp verification edge function
            const response = await fetch('https://ehvdxtyoctgkrgrabfij.supabase.co/functions/v1/whatsapp-verification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTkyNTgsImV4cCI6MjA2MjQ5NTI1OH0.2-dNzfXFO0AKpcWmRQM0svOBCQQ7SBTH5U7ABMYifq8`
              },
              body: JSON.stringify({
                phone,
                code,
                action: 'verify'
              })
            });
            
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Failed to verify WhatsApp code');
            
            // Try to sign in the user
            try {
              await supabaseClient.auth.signInWithPassword({
                phone,
                password: code
              });
            } catch (signInError) {
              // If sign in fails, try OTP sign in as fallback
              await supabaseClient.auth.signInWithOtp({
                phone,
                options: { shouldCreateUser: true }
              });
            }
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Phone verified successfully via WhatsApp' 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (whatsappError) {
            console.error('WhatsApp verification failed, falling back to SMS:', whatsappError);
            // Fall back to standard SMS verification
            const { error } = await supabaseClient.auth.verifyOtp({
              phone,
              token: code,
              type: 'sms'
            });
            
            if (error) throw error;
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Phone verified successfully via SMS' 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          // Use standard SMS OTP verification
          const { error } = await supabaseClient.auth.verifyOtp({
            phone,
            token: code,
            type: 'sms'
          });
          
          if (error) throw error;
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Phone verified successfully via SMS' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } else if (action === 'send') {
      // For test phones, we don't actually send an SMS
      if (isTestPhone) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification code sent (test mode)'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // For real phones, use the appropriate channel
        if (channel === 'whatsapp') {
          try {
            // Call our WhatsApp verification edge function
            const response = await fetch('https://ehvdxtyoctgkrgrabfij.supabase.co/functions/v1/whatsapp-verification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTkyNTgsImV4cCI6MjA2MjQ5NTI1OH0.2-dNzfXFO0AKpcWmRQM0svOBCQQ7SBTH5U7ABMYifq8`
              },
              body: JSON.stringify({
                phone,
                action: 'send'
              })
            });
            
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Failed to send WhatsApp verification');
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Verification code sent via WhatsApp' 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (whatsappError) {
            console.error('WhatsApp verification failed, falling back to SMS:', whatsappError);
            // Fall back to SMS if WhatsApp fails
            const { error } = await supabaseClient.auth.signInWithOtp({
              phone,
              options: {
                channel: 'sms'
              }
            });
            
            if (error) throw error;
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Verification code sent via SMS' 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          // Use standard SMS OTP
          const { error } = await supabaseClient.auth.signInWithOtp({
            phone,
            options: {
              channel: 'sms'
            }
          });
          
          if (error) throw error;
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Verification code sent via SMS' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } else {
      throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error handling phone auth:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
