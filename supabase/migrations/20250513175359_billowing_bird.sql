/*
  # Create conferences table

  1. New Tables
    - `conferences`
      - `id` (uuid, primary key)
      - `title` (text) - Conference title
      - `description` (text) - Detailed description
      - `specialty` (text) - Medical specialty
      - `city` (text) - City location
      - `country` (text) - Country location
      - `date` (date) - Conference date
      - `time` (time) - Conference time
      - `organizer_email` (text) - Organizer's email
      - `image_url` (text) - Optional conference image URL
      - `link` (text) - Conference link (Zoom, YouTube)
      - `created_at` (timestamp) - Creation timestamp

  2. Security
    - Enable RLS
    - Add policies for viewing and managing conferences
*/

-- Create conferences table
CREATE TABLE IF NOT EXISTS conferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  specialty text,
  city text,
  country text,
  date date NOT NULL,
  time time NOT NULL,
  organizer_email text NOT NULL,
  image_url text,
  link text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Conferences are viewable by everyone"
  ON conferences
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizers can insert conferences"
  ON conferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() = organizer_email);

CREATE POLICY "Organizers can update their conferences"
  ON conferences
  FOR UPDATE
  TO authenticated
  USING (auth.email() = organizer_email)
  WITH CHECK (auth.email() = organizer_email);

CREATE POLICY "Organizers can delete their conferences"
  ON conferences
  FOR DELETE
  TO authenticated
  USING (auth.email() = organizer_email);

-- Create index for date searching
CREATE INDEX conferences_date_idx ON conferences (date);

-- Create index for specialty searching
CREATE INDEX conferences_specialty_idx ON conferences (specialty);