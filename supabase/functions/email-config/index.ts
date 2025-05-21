// Follow Deno Deploy edge function format
import { createClient } from 'npm:@supabase/supabase-js';
import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Resend with the API key
const resend = new Resend(Deno.env.get('RESEND_API_KEY') || 're_bYfcFSzd_CAZnropyDzRJWdpeHkGV89ML');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, email, otp } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || 'https://ehvdxtyoctgkrgrabfij.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjkxOTI1OCwiZXhwIjoyMDYyNDk1MjU4fQ.Oi1yzYlQQQDtZBPnRlPGjYYYW1S9H9YBn0rYdDKKFLo',
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    if (action === 'send_otp') {
      if (!email) {
        throw new Error('Email is required');
      }

      // Generate a 6-digit numeric OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the OTP in the database with expiration
      const { error: otpError } = await supabaseClient
        .from('auth_otps')
        .insert({
          email,
          otp: generatedOtp,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes expiration
        });

      if (otpError) throw otpError;

      // Send email with OTP using Resend
      try {
        const { data, error: emailError } = await resend.emails.send({
          from: 'Dr.Zone AI <info@drzone.ai>',
          to: email,
          subject: 'Your Dr.Zone AI Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #0073b6;">Dr.Zone AI</h1>
                <p style="font-size: 18px; color: #333;">Your Verification Code</p>
              </div>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
                <p style="font-size: 16px; margin-bottom: 10px;">Use the following code to verify your email address:</p>
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0073b6;">${generatedOtp}</p>
                <p style="font-size: 14px; color: #666;">This code will expire in 15 minutes.</p>
              </div>
              <div style="font-size: 14px; color: #666; text-align: center;">
                <p>If you didn't request this code, you can safely ignore this email.</p>
                <p>© ${new Date().getFullYear()} Dr.Zone AI. All rights reserved.</p>
                <p>For support, contact <a href="mailto:support@drzone.ai">support@drzone.ai</a></p>
              </div>
            </div>
          `
        });

        if (emailError) {
          console.error('Error sending email:', emailError);
          throw new Error('Failed to send verification email. Please contact support@drzone.ai if the issue persists.');
        }
        
        console.log('Email sent successfully:', data);
      } catch (emailSendError) {
        console.error('Error sending email with Resend:', emailSendError);
        throw new Error('Failed to send verification email. Please contact support@drzone.ai if the issue persists.');
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP sent successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'verify_otp') {
      if (!email || !otp) {
        throw new Error('Email and OTP are required');
      }

      // Verify the OTP
      const { data: otpData, error: otpError } = await supabaseClient
        .from('auth_otps')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (otpError || !otpData) {
        throw new Error('Invalid or expired verification code. Please try again or request a new code.');
      }

      // Delete the used OTP
      await supabaseClient
        .from('auth_otps')
        .delete()
        .eq('id', otpData.id);

      // Get user by email
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email);
      
      if (userError) throw userError;

      // If user exists, sign them in
      if (userData?.user) {
        // Update email_confirmed_at if not already set
        if (!userData.user.email_confirmed_at) {
          await supabaseClient.auth.admin.updateUserById(
            userData.user.id,
            { email_confirmed_at: new Date().toISOString() }
          );
        }

        // Generate a session for the user
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
        throw new Error('User not found. Please sign up first.');
      }
    } else {
      throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error handling email config:', error);
    
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
