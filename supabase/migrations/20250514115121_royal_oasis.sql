/*
  # Create podcast system tables

  1. New Tables
    - `podcasts`
      - For storing podcast metadata and content
      - Includes transcript and show notes
    
    - `podcast_likes`
      - Records user likes for podcasts
    
    - `podcast_comments`
      - Stores user comments on podcasts

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
  likes_count integer DEFAULT 0,
  plays_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create podcast_likes table
CREATE TABLE IF NOT EXISTS podcast_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id uuid REFERENCES podcasts ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(podcast_id, user_id)
);

-- Create podcast_comments table
CREATE TABLE IF NOT EXISTS podcast_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id uuid REFERENCES podcasts ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_comments ENABLE ROW LEVEL SECURITY;

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

-- Podcast likes policies
CREATE POLICY "Podcast likes are viewable by everyone"
  ON podcast_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can like podcasts"
  ON podcast_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike podcasts"
  ON podcast_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Podcast comments policies
CREATE POLICY "Podcast comments are viewable by everyone"
  ON podcast_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create podcast comments"
  ON podcast_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcast comments"
  ON podcast_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX podcasts_host_id_idx ON podcasts(host_id);
CREATE INDEX podcasts_specialty_idx ON podcasts(specialty);
CREATE INDEX podcasts_created_at_idx ON podcasts(created_at DESC);
CREATE INDEX podcast_likes_podcast_id_idx ON podcast_likes(podcast_id);
CREATE INDEX podcast_comments_podcast_id_idx ON podcast_comments(podcast_id);

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

CREATE TRIGGER update_podcast_comments_updated_at
  BEFORE UPDATE ON podcast_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();