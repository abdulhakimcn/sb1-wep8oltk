/*
  # Create jobs system tables

  1. New Tables
    - `jobs`
      - Job listings with details and requirements
    - `job_applications`
      - Track applications and their status
    - `job_categories`
      - Categorize jobs by type/field

  2. Security
    - Enable RLS
    - Add policies for job management
*/

-- Create job_categories table
CREATE TABLE IF NOT EXISTS job_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  category_id uuid REFERENCES job_categories(id),
  type text NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'temporary')),
  location text NOT NULL,
  is_remote boolean DEFAULT false,
  description text NOT NULL,
  requirements text[] DEFAULT '{}'::text[],
  salary_range jsonb,
  contact_email text NOT NULL,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
  cover_letter text,
  resume_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

-- Enable RLS
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Job categories policies
CREATE POLICY "Job categories are viewable by everyone"
  ON job_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizations can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      JOIN profiles ON organizations.profile_id = profiles.id
      WHERE organizations.id = NEW.company_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizations can update their jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      JOIN profiles ON organizations.profile_id = profiles.id
      WHERE organizations.id = company_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      JOIN profiles ON organizations.profile_id = profiles.id
      WHERE organizations.id = company_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Job applications policies
CREATE POLICY "Users can view their own applications"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (
    applicant_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM jobs
      JOIN organizations ON jobs.company_id = organizations.id
      JOIN profiles ON organizations.profile_id = profiles.id
      WHERE jobs.id = job_applications.job_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications"
  ON job_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    applicant_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX jobs_category_id_idx ON jobs(category_id);
CREATE INDEX jobs_company_id_idx ON jobs(company_id);
CREATE INDEX jobs_created_at_idx ON jobs(created_at DESC);
CREATE INDEX job_applications_job_id_idx ON job_applications(job_id);
CREATE INDEX job_applications_applicant_id_idx ON job_applications(applicant_id);

-- Insert initial categories
INSERT INTO job_categories (name, slug, description) VALUES
  ('Medical Doctor', 'medical-doctor', 'Positions for licensed medical doctors and specialists'),
  ('Nursing', 'nursing', 'Nursing positions across all specialties'),
  ('Research', 'research', 'Medical research and clinical trial positions'),
  ('Administration', 'administration', 'Healthcare administration and management roles'),
  ('Technical', 'technical', 'Medical technology and technical positions');

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();