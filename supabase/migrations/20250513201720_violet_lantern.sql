/*
  # Create dream bottles schema

  1. New Tables
    - `dream_bottles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `timestamp` (timestamptz)
      - `matched_with` (uuid, references dream_bottles)
      - `status` (text) - 'active', 'matched', 'expired'

  2. Security
    - Enable RLS
    - Add policies for dream bottle access
*/

-- Create dream_bottles table
CREATE TABLE IF NOT EXISTS dream_bottles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  content text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  matched_with uuid REFERENCES dream_bottles(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'matched', 'expired'))
);

-- Enable RLS
ALTER TABLE dream_bottles ENABLE ROW LEVEL SECURITY;

-- Dream bottles policies
CREATE POLICY "Users can view their own dream bottles"
  ON dream_bottles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create dream bottles"
  ON dream_bottles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dream bottles"
  ON dream_bottles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX dream_bottles_user_id_idx ON dream_bottles(user_id);
CREATE INDEX dream_bottles_timestamp_idx ON dream_bottles(timestamp DESC);
CREATE INDEX dream_bottles_status_idx ON dream_bottles(status);

-- Create function to expire old bottles
CREATE OR REPLACE FUNCTION expire_old_dream_bottles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dream_bottles
  SET status = 'expired'
  WHERE status = 'active'
    AND timestamp < NOW() - INTERVAL '1 day';
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to expire old bottles
CREATE TRIGGER expire_old_dream_bottles_trigger
  AFTER INSERT ON dream_bottles
  EXECUTE FUNCTION expire_old_dream_bottles();