/*
  # Premium Videos Schema

  1. New Tables
    - `videos`
      - For storing video metadata and pricing
      - Tracks views and purchases
    
    - `video_purchases`
      - Records user purchases
      - Manages access control

  2. Security
    - Enable RLS
    - Add policies for secure access
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text NOT NULL,
  duration text,
  price numeric(10,2) DEFAULT 0,
  is_premium boolean DEFAULT false,
  views_count integer DEFAULT 0,
  category text,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create video_purchases table
CREATE TABLE IF NOT EXISTS video_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_purchases ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Videos are viewable by everyone"
  ON videos
  FOR SELECT
  USING (true);

CREATE POLICY "Creators can insert videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = creator_id
  ));

CREATE POLICY "Creators can update their videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = creator_id
  ))
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = creator_id
  ));

-- Video purchases policies
CREATE POLICY "Users can view their purchases"
  ON video_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
  ON video_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX videos_creator_id_idx ON videos(creator_id);
CREATE INDEX videos_category_idx ON videos(category);
CREATE INDEX videos_is_premium_idx ON videos(is_premium);
CREATE INDEX video_purchases_video_id_idx ON video_purchases(video_id);
CREATE INDEX video_purchases_user_id_idx ON video_purchases(user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_videos_updated_at();