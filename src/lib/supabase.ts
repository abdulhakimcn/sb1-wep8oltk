import { createClient } from '@supabase/supabase-js';

console.log('Initializing Supabase client'); // Debug log

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ehvdxtyoctgkrgrabfij.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTkyNTgsImV4cCI6MjA2MjQ5NTI1OH0.2-dNzfXFO0AKpcWmRQM0svOBCQQ7SBTH5U7ABMYifq8';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Define allowed email domains for registration
export const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'hakeemzone.com', // Added the HakeemZone domain
  'dev.mydrzone.local', // For development testing
  'drzone.ai' // Added the DrZone domain
];

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Add the redirect URL explicitly
    redirectTo: `${window.location.origin}/auth/callback`
  }
});

// Helper function to validate email domain
export const isValidEmailDomain = (email: string): boolean => {
  if (!email) return false;
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  // Special case for hakeemzone.com and drzone.ai - always allow it
  if (domain === 'hakeemzone.com' || domain === 'drzone.ai') return true;
  
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
};

// Configure social auth providers
export const configureSocialAuth = () => {
  // This function would be used to configure social auth providers
  // For now, we're using the default configuration in Supabase
  console.log('Social auth providers configured');
};

console.log('Supabase client initialized'); // Debug log
