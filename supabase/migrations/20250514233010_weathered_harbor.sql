-- Create a migration to fix the relationship between posts and profiles

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
  is_verified boolean DEFAULT false,
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
  END IF;
END $$;

-- Create index on profile_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'posts_profile_id_idx'
  ) THEN
    CREATE INDEX posts_profile_id_idx ON posts(profile_id);
  END IF;
END $$;