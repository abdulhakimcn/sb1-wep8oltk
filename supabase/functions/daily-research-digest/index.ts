// Follow Deno Deploy edge function format
import { createClient } from 'npm:@supabase/supabase-js';
import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Resend with API key
const resend = new Resend('re_TzNVt4B8_67yTBenM1TfrdcQ63NGEX4LK');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      'https://ehvdxtyoctgkrgrabfij.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTkyNTgsImV4cCI6MjA2MjQ5NTI1OH0.2-dNzfXFO0AKpcWmRQM0svOBCQQ7SBTH5U7ABMYifq8',
      { auth: { persistSession: false } }
    );

    // Get all active subscriptions
    const { data: subscriptions, error: subscriptionError } = await supabaseClient
      .from('research_subscriptions')
      .select(`
        id,
        user_id,
        specialty,
        frequency,
        profiles:profiles!inner(email, full_name)
      `)
      .eq('frequency', 'daily'); // Only daily for now

    if (subscriptionError) throw subscriptionError;

    // Process each subscription
    for (const subscription of subscriptions || []) {
      // Get latest research papers for this specialty
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: papers, error: papersError } = await supabaseClient
        .from('research_papers')
        .select('*')
        .eq('specialty', subscription.specialty)
        .gte('publication_date', yesterday.toISOString())
        .order('publication_date', { ascending: false });

      if (papersError) throw papersError;

      if (papers && papers.length > 0) {
        // Send email with Resend
        try {
          const { data, error: emailError } = await resend.emails.send({
            from: 'Dr.Zone AI <info@drzone.ai>',
            to: subscription.profiles.email,
            subject: `Your Daily ${subscription.specialty} Research Digest`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #0073b6;">Dr.Zone AI</h1>
                  <p style="font-size: 18px; color: #333;">Your Daily Research Digest</p>
                </div>
                <div style="margin-bottom: 20px;">
                  <p>Hello ${subscription.profiles.full_name},</p>
                  <p>Here are the latest research papers in ${subscription.specialty}:</p>
                </div>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  ${papers.map(paper => `
                    <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0;">
                      <h3 style="margin: 0 0 5px 0; color: #0073b6;">${paper.title}</h3>
                      <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">${paper.journal} • ${new Date(paper.publication_date).toLocaleDateString()}</p>
                      <p style="margin: 0; font-size: 14px;">${paper.abstract.substring(0, 150)}...</p>
                    </div>
                  `).join('')}
                </div>
                <div style="text-align: center;">
                  <a href="https://www.drzone.ai/researchzone" style="display: inline-block; background-color: #0073b6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View All Research</a>
                </div>
                <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
                  <p>© ${new Date().getFullYear()} Dr.Zone AI. All rights reserved.</p>
                  <p>You're receiving this email because you subscribed to research updates in ${subscription.specialty}.</p>
                </div>
              </div>
            `
          });

          if (emailError) {
            console.error('Error sending email:', emailError);
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Research digests processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing research digests:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
