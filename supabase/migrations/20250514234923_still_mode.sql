-- Add a function to check if a user is a developer account
CREATE OR REPLACE FUNCTION is_dev_account(user_id uuid)
RETURNS boolean AS $$
DECLARE
  is_dev boolean;
BEGIN
  SELECT (raw_user_meta_data->>'is_dev_account')::boolean INTO is_dev
  FROM auth.users
  WHERE id = user_id;
  
  RETURN COALESCE(is_dev, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy to allow dev accounts to bypass email verification
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow dev accounts to bypass email verification'
  ) THEN
    CREATE POLICY "Allow dev accounts to bypass email verification"
      ON auth.users
      FOR UPDATE
      USING (true)
      WITH CHECK (
        (raw_user_meta_data->>'is_dev_account')::boolean = true OR
        email_confirmed_at IS NOT NULL
      );
  END IF;
END $$;