/*
  # Add podcast schema

  1. New Tables
    - `podcasts`
      - Basic podcast information (title, description, etc.)
      - Audio file URL and metadata
      - Host information and specialty
      - Transcript and show notes
    
  2. Security
    - Enable RLS
    - Add policies for secure access
*/

-- Create podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  audio_url text NOT NULL,
  thumbnail_url text,
  duration text NOT NULL,
  specialty text,
  transcript text,
  show_notes text,
  host_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- Podcasts policies
CREATE POLICY "Podcasts are viewable by everyone"
  ON podcasts
  FOR SELECT
  USING (true);

CREATE POLICY "Hosts can create podcasts"
  ON podcasts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = host_id
  ));

CREATE POLICY "Hosts can update their podcasts"
  ON podcasts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = host_id
  ))
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = host_id
  ));

-- Create indexes
CREATE INDEX podcasts_host_id_idx ON podcasts(host_id);
CREATE INDEX podcasts_specialty_idx ON podcasts(specialty);
CREATE INDEX podcasts_created_at_idx ON podcasts(created_at DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_podcasts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_podcasts_updated_at
  BEFORE UPDATE ON podcasts
  FOR EACH ROW
  EXECUTE FUNCTION update_podcasts_updated_at();