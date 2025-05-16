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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
        // In a real implementation, this would send an email
        console.log(`Sending digest to ${subscription.profiles.email} with ${papers.length} papers`);
        
        // For demonstration, we'll just log the email content
        const emailContent = {
          to: subscription.profiles.email,
          subject: `Your Daily ${subscription.specialty} Research Digest`,
          body: `
            Hello ${subscription.profiles.full_name},
            
            Here are the latest research papers in ${subscription.specialty}:
            
            ${papers.map(paper => `- ${paper.title} (${paper.journal})`).join('\n')}
            
            View these papers and more at https://drzone.ai/researchzone
          `
        };
        
        console.log('Email content:', emailContent);
        
        // In a real implementation, you would use an email service like SendGrid, AWS SES, etc.
        // await sendEmail(emailContent);
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