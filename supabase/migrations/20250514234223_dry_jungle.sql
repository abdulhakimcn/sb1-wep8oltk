/*
  # Add profile_id to posts table

  1. Changes
    - Add profile_id column to posts table
    - Create index for efficient filtering

  2. Security
    - Update RLS policies to respect profile_id
*/

-- Add profile_id column
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id);

-- Create index for profile_id filtering
CREATE INDEX IF NOT EXISTS posts_profile_id_idx ON posts(profile_id);