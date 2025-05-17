/*
  # Create auth rate limits table

  1. New Tables
    - `auth_rate_limits`
      - For tracking authentication attempts to prevent abuse
      - Stores phone number, action type, and timestamp

  2. Security
    - Enable RLS
    - Add policies for secure access
*/

-- Create auth_rate_limits table
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for efficient querying
CREATE INDEX auth_rate_limits_phone_created_at_idx ON auth_rate_limits(phone, created_at);

-- Create policy to allow service role to insert
CREATE POLICY "Service role can insert rate limits"
  ON auth_rate_limits
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policy to allow service role to select
CREATE POLICY "Service role can select rate limits"
  ON auth_rate_limits
  FOR SELECT
  TO service_role
  USING (true);

-- Create function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_rate_limits
  WHERE created_at < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run the cleanup function daily
SELECT cron.schedule(
  'cleanup-auth-rate-limits',
  '0 0 * * *',  -- Run at midnight every day
  $$SELECT cleanup_old_rate_limits()$$
);
