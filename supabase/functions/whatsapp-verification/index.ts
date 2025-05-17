// Follow Deno Deploy edge function format
import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, action, code, userData } = await req.json();

    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    if (action === 'send') {
      // In a real implementation, this would call a WhatsApp API service
      // For now, we'll simulate success
      console.log(`Simulating WhatsApp verification code sent to ${phone}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent via WhatsApp',
          // For testing, we'll return a fixed code
          testCode: '123456'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'verify') {
      if (!code) {
        throw new Error('Verification code is required');
      }

      // In a real implementation, this would verify the code with a WhatsApp API
      // For now, we'll simulate verification and create a user
      console.log(`Simulating WhatsApp verification for ${phone} with code ${code}`);
      
      // Check if user exists
      const { data: existingUser, error: userError } = await supabaseClient.auth.admin.getUserByPhone(phone);
      
      if (userError && userError.message !== 'User not found') {
        throw userError;
      }
      
      // If user doesn't exist, create one
      if (!existingUser?.user) {
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          phone,
          phone_confirm: true,
          user_metadata: { 
            verification_method: 'whatsapp',
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
              full_name: userData?.full_name || `User (${phone})`,
              type: userData?.account_type || 'doctor',
              specialty: userData?.specialty || 'General Practice',
              is_public: true
            });
            
          if (profileError) throw profileError;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Phone verified successfully via WhatsApp' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error handling WhatsApp verification:', error);
    
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
