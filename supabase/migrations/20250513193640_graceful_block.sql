/*
  # Add privacy settings to posts table

  1. Changes
    - Add privacy column to posts table
    - Add RLS policies for privacy settings
    - Create index for efficient filtering

  2. Security
    - Update RLS policies to respect privacy settings
*/

-- Add privacy column
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS privacy text DEFAULT 'users' 
  CHECK (privacy IN ('public', 'users', 'connections'));

-- Create index for privacy filtering
CREATE INDEX IF NOT EXISTS posts_privacy_idx ON posts(privacy);

-- Update RLS policies
DROP POLICY IF EXISTS "Posts are viewable by authenticated users" ON posts;

-- Public posts are viewable by everyone
CREATE POLICY "Public posts are viewable by everyone"
  ON posts
  FOR SELECT
  USING (privacy = 'public');

-- Users-only posts are viewable by authenticated users
CREATE POLICY "Users-only posts are viewable by authenticated users"
  ON posts
  FOR SELECT
  TO authenticated
  USING (privacy = 'users');

-- Connection-only posts are viewable by connections
CREATE POLICY "Connection-only posts are viewable by connections"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    privacy = 'connections' AND
    EXISTS (
      SELECT 1 FROM connections
      WHERE (user_id = auth.uid() AND friend_id = posts.user_id)
      OR (friend_id = auth.uid() AND user_id = posts.user_id)
    )
  );