/*
  # Create match test system tables

  1. New Tables
    - `match_tests`
      - Stores user's personality test results
      - Includes answers and result type
    
    - `matches`
      - Tracks matches between users
      - Records match status and who initiated

  2. Security
    - Enable RLS
    - Add policies for test results and matches
*/

-- Create match_tests table
CREATE TABLE IF NOT EXISTS match_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  result_type text NOT NULL,
  answers jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1 uuid REFERENCES auth.users ON DELETE CASCADE,
  user2 uuid REFERENCES auth.users ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  initiated_by uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user1, user2)
);

-- Enable RLS
ALTER TABLE match_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Match tests policies
CREATE POLICY "Users can view their own test results"
  ON match_tests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create test results"
  ON match_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user1 OR
    auth.uid() = user2
  );

CREATE POLICY "Users can create matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = initiated_by AND
    auth.uid() IN (user1, user2)
  );

CREATE POLICY "Users can update their matches"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (user1, user2))
  WITH CHECK (auth.uid() IN (user1, user2));

-- Create indexes
CREATE INDEX match_tests_user_id_idx ON match_tests(user_id);
CREATE INDEX match_tests_result_type_idx ON match_tests(result_type);
CREATE INDEX matches_user1_idx ON matches(user1);
CREATE INDEX matches_user2_idx ON matches(user2);
CREATE INDEX matches_status_idx ON matches(status);