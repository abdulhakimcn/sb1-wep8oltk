/*
  # Create unified media storage system

  1. New Tables
    - `media`
      - Unified table for both videos and podcasts
      - Stores metadata like title, description, type, etc.
      - Tracks views, likes, and other engagement metrics
    
    - `media_likes`
      - Records user likes for media content
    
    - `media_comments`
      - Stores user comments on media content

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
*/

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('video', 'podcast')),
  duration text NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  language text DEFAULT 'en',
  category text,
  specialty text,
  is_premium boolean DEFAULT false,
  price numeric(10,2) DEFAULT 0,
  tags text[] DEFAULT '{}'::text[],
  transcript text,
  show_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_likes table
CREATE TABLE IF NOT EXISTS media_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(media_id, user_id)
);

-- Create media_comments table
CREATE TABLE IF NOT EXISTS media_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_comments ENABLE ROW LEVEL SECURITY;

-- Media policies
CREATE POLICY "Media is viewable by everyone"
  ON media
  FOR SELECT
  USING (true);

CREATE POLICY "Creators can insert media"
  ON media
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = creator_id
  ));

CREATE POLICY "Creators can update their media"
  ON media
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = creator_id
  ))
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = creator_id
  ));

-- Media likes policies
CREATE POLICY "Media likes are viewable by everyone"
  ON media_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can like media"
  ON media_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike media"
  ON media_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Media comments policies
CREATE POLICY "Media comments are viewable by everyone"
  ON media_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create media comments"
  ON media_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media comments"
  ON media_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX media_creator_id_idx ON media(creator_id);
CREATE INDEX media_type_idx ON media(type);
CREATE INDEX media_category_idx ON media(category);
CREATE INDEX media_specialty_idx ON media(specialty);
CREATE INDEX media_language_idx ON media(language);
CREATE INDEX media_created_at_idx ON media(created_at DESC);
CREATE INDEX media_likes_media_id_idx ON media_likes(media_id);
CREATE INDEX media_comments_media_id_idx ON media_comments(media_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_media_updated_at();

CREATE TRIGGER update_media_comments_updated_at
  BEFORE UPDATE ON media_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment likes count
CREATE OR REPLACE FUNCTION increment_media_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE media
  SET likes_count = likes_count + 1
  WHERE id = NEW.media_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_media_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE media
  SET likes_count = likes_count - 1
  WHERE id = OLD.media_id;
  RETURN OLD;
END;
$$ language 'plpgsql';

-- Create triggers for likes count
CREATE TRIGGER increment_media_likes_trigger
  AFTER INSERT ON media_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_media_likes();

CREATE TRIGGER decrement_media_likes_trigger
  AFTER DELETE ON media_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_media_likes();

-- Create function to increment comments count
CREATE OR REPLACE FUNCTION increment_media_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE media
  SET comments_count = comments_count + 1
  WHERE id = NEW.media_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to decrement comments count
CREATE OR REPLACE FUNCTION decrement_media_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE media
  SET comments_count = comments_count - 1
  WHERE id = OLD.media_id;
  RETURN OLD;
END;
$$ language 'plpgsql';

-- Create triggers for comments count
CREATE TRIGGER increment_media_comments_trigger
  AFTER INSERT ON media_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_media_comments();

CREATE TRIGGER decrement_media_comments_trigger
  AFTER DELETE ON media_comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_media_comments();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_media_views(media_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE media
  SET views_count = views_count + 1
  WHERE id = media_id;
END;
$$ language 'plpgsql';

-- Create RPC function to increment views
CREATE OR REPLACE FUNCTION increment_media_views_rpc(id uuid)
RETURNS void AS $$
BEGIN
  PERFORM increment_media_views(id);
END;
$$ language 'plpgsql';