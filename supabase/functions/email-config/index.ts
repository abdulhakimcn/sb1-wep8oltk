// Follow Deno Deploy edge function format
import { createClient } from 'npm:@supabase/supabase-js';
import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Resend with environment variable
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, email, otp } = await req.json();

    // Create Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    if (action === 'send_otp') {
      if (!email) throw new Error('Email is required');

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { error: otpError } = await supabaseClient
        .from('auth_otps')
        .insert({
          email,
          otp: generatedOtp,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        });

      if (otpError) throw otpError;

      // Send email with OTP using Resend
      const { data, error: emailError } = await resend.emails.send({
        from: 'Dr.Zone AI <info@drzone.ai>',
        to: email,
        subject: 'Your Dr.Zone AI Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h1 style="color: #0073b6;">Dr.Zone AI</h1>
            <p>Your Verification Code:</p>
            <h2 style="color: #0073b6;">${generatedOtp}</h2>
            <p>This code will expire in 15 minutes.</p>
          </div>
        `
      });

      if (emailError) throw new Error('Failed to send verification email');

      return new Response(
        JSON.stringify({ success: true, message: 'OTP sent successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'verify_otp') {
      if (!email || !otp) throw new Error('Email and OTP are required');

      const { data: otpData, error: otpError } = await supabaseClient
        .from('auth_otps')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (otpError || !otpData) {
        throw new Error('Invalid or expired verification code');
      }

      await supabaseClient
        .from('auth_otps')
        .delete()
        .eq('id', otpData.id);

      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email);
      if (userError) throw userError;

      if (userData?.user) {
        if (!userData.user.email_confirmed_at) {
          await supabaseClient.auth.admin.updateUserById(
            userData.user.id,
            { email_confirmed_at: new Date().toISOString() }
          );
        }

        const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.createSession({
          user_id: userData.user.id
        });

        if (sessionError) throw sessionError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'OTP verified successfully',
            session: sessionData 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error('User not found');
      }

    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
