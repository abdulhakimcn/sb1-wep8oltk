// Follow Deno Deploy edge function format
import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of allowed email domains
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'hakeemzone.com', // Added the HakeemZone domain
  'dev.mydrzone.local' // For development testing
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    // Validate email domain
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      throw new Error('Invalid email format');
    }

    const isAllowed = ALLOWED_EMAIL_DOMAINS.includes(domain);

    return new Response(
      JSON.stringify({ 
        success: true, 
        isAllowed,
        message: isAllowed 
          ? 'Email domain is allowed' 
          : 'Email domain is not in the allowed list'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error validating email domain:', error);
    
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