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
    const { researchId } = await req.json();

    if (!researchId) {
      throw new Error('Research ID is required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get research paper
    const { data: paper, error: paperError } = await supabaseClient
      .from('research_papers')
      .select('*')
      .eq('id', researchId)
      .single();

    if (paperError) throw paperError;
    if (!paper) throw new Error('Research paper not found');

    // In a real implementation, this would call an AI service like OpenAI
    // For demonstration, we'll generate a simple summary
    const summary = generateSummary(paper.abstract);

    // Store the summary in the database for future use
    const { error: updateError } = await supabaseClient
      .from('research_papers')
      .update({ ai_summary: summary })
      .eq('id', researchId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error summarizing research:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simple function to generate a summary
// In a real implementation, this would use an AI model
function generateSummary(abstract: string): string {
  // Simulate AI processing time
  // In a real implementation, this would call an AI service
  
  const sentences = abstract.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let summary = '';
  
  if (sentences.length <= 2) {
    summary = abstract;
  } else {
    // Take first sentence and last sentence
    summary = `${sentences[0]}. ${sentences[Math.min(2, sentences.length - 1)]}.`;
    
    // Add a synthesized conclusion
    summary += ' This research provides valuable insights that could impact clinical practice in this field.';
  }
  
  return summary;
}