// Follow Deno Deploy edge function format
import { createClient } from 'npm:@supabase/supabase-js';
import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// استخدم المتغيرات البيئية بدلاً من كتابة القيم مباشرة
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, email, otp } = await req.json();

    if (action === 'send_otp') {
      if (!email) throw new Error('Email is required');

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const { error: otpError } = await supabaseClient
        .from('auth_otps')
        .insert({
          email,
          otp,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        });

      if (otpError) throw otpError;

      const { error: emailError } = await resend.emails.send({
        from: 'Dr.Zone AI <info@drzone.ai>',
        to: email,
        subject: 'Your Dr.Zone AI Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="text-align: center; color: #0073b6;">Dr.Zone AI</h2>
            <p style="text-align: center; font-size: 24px;">🔐 ${otp}</p>
            <p style="text-align: center;">This code expires in 15 minutes.</p>
            <hr />
            <p style="font-size: 12px; color: gray; text-align: center;">If you did not request this code, ignore this email.</p>
            <p style="font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Dr.Zone AI</p>
          </div>
        `
      });

      if (emailError) {
        console.error('Resend email error:', emailError);
        throw new Error('Failed to send verification email. Please contact support@drzone.ai');
      }

      return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    else if (action === 'verify_otp') {
      if (!email || !otp) throw new Error('Email and OTP are required');

      const { data: otpData, error: otpError } = await supabaseClient
        .from('auth_otps')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (otpError || !otpData) throw new Error('Invalid or expired OTP');

      await supabaseClient.from('auth_otps').delete().eq('id', otpData.id);

      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email);
      if (userError) throw userError;

      if (userData?.user) {
        if (!userData.user.email_confirmed_at) {
          await supabaseClient.auth.admin.updateUserById(userData.user.id, {
            email_confirmed_at: new Date().toISOString()
          });
        }

        const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.createSession({
          user_id: userData.user.id
        });

        if (sessionError) throw sessionError;

        return new Response(JSON.stringify({
          success: true,
          message: 'OTP verified successfully',
          session: sessionData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        throw new Error('User not found. Please sign up first.');
      }
    }

    else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
