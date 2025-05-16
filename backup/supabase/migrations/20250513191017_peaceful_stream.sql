/*
  # Add verification requests table

  1. New Tables
    - `verification_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `license_number` (text)
      - `issuing_authority` (text)
      - `specialty_board` (text)
      - `document_url` (text)
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `reviewed_by` (uuid, references auth.users)
      - `reviewed_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for secure access
*/

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  license_number text NOT NULL,
  issuing_authority text NOT NULL,
  specialty_board text,
  document_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add verified column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Enable RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Verification requests policies
CREATE POLICY "Users can view their own verification requests"
  ON verification_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification requests"
  ON verification_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_verification_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_requests_updated_at();

-- Create indexes
CREATE INDEX verification_requests_user_id_idx ON verification_requests(user_id);
CREATE INDEX verification_requests_status_idx ON verification_requests(status);