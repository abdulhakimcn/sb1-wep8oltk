/*
  # Add profile_id to posts and fix relationships

  1. Changes
    - Add profile_id column to posts table
    - Create foreign key relationship between posts and profiles
    - Update existing posts to link to profiles via user_id
  
  2. Security
    - Maintain existing RLS policies
*/

-- First ensure the profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  type text NOT NULL CHECK (type IN ('doctor', 'organization')),
  specialty text,
  bio text,
  location text,
  website text,
  social_links jsonb DEFAULT '{}'::jsonb,
  education jsonb[] DEFAULT '{}'::jsonb[],
  experience jsonb[] DEFAULT '{}'::jsonb[],
  publications jsonb[] DEFAULT '{}'::jsonb[],
  languages text[] DEFAULT '{}'::text[],
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add profile_id to posts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'profile_id'
  ) THEN
    -- Add profile_id column
    ALTER TABLE posts ADD COLUMN profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
    
    -- Update existing posts to link to profiles
    UPDATE posts
    SET profile_id = profiles.id
    FROM profiles
    WHERE posts.user_id = profiles.user_id;
    
    -- Make profile_id NOT NULL after updating existing records
    ALTER TABLE posts ALTER COLUMN profile_id SET NOT NULL;
  END IF;
END $$;

-- Create index on profile_id
CREATE INDEX IF NOT EXISTS posts_profile_id_idx ON posts(profile_id);

-- Update or create the foreign key constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'posts_profile_id_fkey'
  ) THEN
    ALTER TABLE posts
    ADD CONSTRAINT posts_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;