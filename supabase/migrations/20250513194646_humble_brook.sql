/*
  # Jobs System Schema

  1. New Tables
    - `jobs`
      - Basic job information (title, description, etc.)
      - Location and type details
      - Salary information
      - Contact details
    
    - `job_applications`
      - Links users to jobs
      - Tracks application status
      - Stores resume/CV info

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
*/

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  specialty text NOT NULL,
  salary jsonb,
  type text NOT NULL CHECK (type IN ('full-time', 'part-time', 'fellowship', 'volunteer')),
  contact_email text NOT NULL,
  posted_by uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs ON DELETE CASCADE,
  applicant_id uuid REFERENCES auth.users ON DELETE CASCADE,
  cover_letter text,
  resume_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Users can update their own jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = posted_by)
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Users can delete their own jobs"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = posted_by);

-- Job applications policies
CREATE POLICY "Users can view their own applications"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (
    applicant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id
      AND jobs.posted_by = auth.uid()
    )
  );

CREATE POLICY "Users can create applications"
  ON job_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Users can update their own applications"
  ON job_applications
  FOR UPDATE
  TO authenticated
  USING (applicant_id = auth.uid())
  WITH CHECK (applicant_id = auth.uid());

-- Create indexes
CREATE INDEX jobs_specialty_idx ON jobs(specialty);
CREATE INDEX jobs_type_idx ON jobs(type);
CREATE INDEX jobs_location_idx ON jobs(location);
CREATE INDEX jobs_posted_by_idx ON jobs(posted_by);
CREATE INDEX job_applications_job_id_idx ON job_applications(job_id);
CREATE INDEX job_applications_applicant_id_idx ON job_applications(applicant_id);

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

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();