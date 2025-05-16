-- Add status column to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create media_reviews table for admin reviews
CREATE TABLE IF NOT EXISTS media_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('approved', 'rejected')),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE media_reviews ENABLE ROW LEVEL SECURITY;

-- Media reviews policies
CREATE POLICY "Media reviews are viewable by admins and creators"
  ON media_reviews
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reviewer_id OR
    EXISTS (
      SELECT 1 FROM media
      JOIN profiles ON media.creator_id = profiles.id
      WHERE media.id = media_reviews.media_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create media reviews"
  ON media_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- This would be replaced with actual admin check in production
    -- For now, we'll allow any authenticated user to review
    auth.uid() IS NOT NULL
  );

-- Create indexes
CREATE INDEX media_status_idx ON media(status);
CREATE INDEX media_reviews_media_id_idx ON media_reviews(media_id);
CREATE INDEX media_reviews_reviewer_id_idx ON media_reviews(reviewer_id);

-- Create function to update media status when reviewed
CREATE OR REPLACE FUNCTION update_media_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE media
  SET status = NEW.status
  WHERE id = NEW.media_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_media_status_trigger
  AFTER INSERT ON media_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_media_status();

-- Add policy to only show approved media to non-creators
CREATE POLICY "Only approved media is viewable by non-creators"
  ON media
  FOR SELECT
  USING (
    status = 'approved' OR
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = creator_id
    )
  );