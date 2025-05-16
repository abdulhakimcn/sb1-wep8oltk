/*
  # Create research subscriptions table

  1. New Tables
    - `research_subscriptions`
      - For managing user subscriptions to research updates
      - Tracks specialty and frequency preferences

  2. Security
    - Enable RLS
    - Add policies for secure access
*/

-- Create research_subscriptions table
CREATE TABLE IF NOT EXISTS research_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  specialty text NOT NULL,
  frequency text DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE research_subscriptions ENABLE ROW LEVEL SECURITY;

-- Research subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON research_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON research_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON research_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON research_subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX research_subscriptions_user_id_idx ON research_subscriptions(user_id);
CREATE INDEX research_subscriptions_specialty_idx ON research_subscriptions(specialty);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_research_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_research_subscriptions_updated_at
  BEFORE UPDATE ON research_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_research_subscriptions_updated_at();