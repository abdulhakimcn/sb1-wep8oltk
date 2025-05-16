// Follow Deno Deploy edge function format
import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pre-configured test phone numbers and their verification codes
const TEST_PHONES = {
  '+967774168043': '123456',
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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
                  type: userData?.account_type || 'doctor',
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
          // In a real implementation, this would call a WhatsApp API
          // For now, we'll simulate success
          console.log(`Simulating WhatsApp verification for ${phone} with code ${code}`);
          
          // Verify the user's phone number
          const { data, error } = await supabaseClient.auth.admin.getUserByPhone(phone);
          
          if (error && error.message !== 'User not found') {
            throw error;
          }
          
          // If user doesn't exist, create one
          if (!data?.user) {
            const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
              phone,
              phone_confirm: true,
              user_metadata: userData || {}
            });
            
            if (createError) throw createError;
            
            // Create a profile for the new user
            if (newUser?.user) {
              const { error: profileError } = await supabaseClient
                .from('profiles')
                .insert({
                  user_id: newUser.user.id,
                  username: `user_${phone.replace(/\+/g, '')}`,
                  full_name: userData?.full_name || `User (${phone})`,
                  type: userData?.account_type || 'doctor',
                  specialty: userData?.specialty || 'General Practice',
                  is_public: true
                });
                
              if (profileError) throw profileError;
            }
          }
        } else {
          // Standard SMS verification
          const { error } = await supabaseClient.auth.verifyOtp({
            phone,
            token: code,
            type: 'sms'
          });
          
          if (error) throw error;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Phone verified successfully' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (action === 'send') {
      // For test phones, we don't actually send an SMS
      if (isTestPhone) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification code sent (test mode)',
            testCode: TEST_PHONES[phone]
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // For real phones, use the appropriate channel
        if (channel === 'whatsapp') {
          // In a real implementation, this would call a WhatsApp API
          // For now, we'll simulate success
          console.log(`Simulating WhatsApp verification code sent to ${phone}`);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Verification code sent via WhatsApp' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Use Supabase to send SMS OTP
          const { error } = await supabaseClient.auth.signInWithOtp({
            phone
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
