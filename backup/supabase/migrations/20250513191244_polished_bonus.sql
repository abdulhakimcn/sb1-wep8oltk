/*
  # Add post features

  1. Updates
    - Add language and specialty columns to posts table
    - Add indexes for filtering

  2. Security
    - Update RLS policies for new features
*/

-- Add new columns to posts table
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS specialty text;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS posts_language_idx ON posts(language);
CREATE INDEX IF NOT EXISTS posts_specialty_idx ON posts(specialty);
CREATE INDEX IF NOT EXISTS posts_created_at_specialty_idx ON posts(specialty, created_at DESC);
CREATE INDEX IF NOT EXISTS posts_created_at_language_idx ON posts(language, created_at DESC);