/*
  # Add check_email_exists function
  
  1. New Function
    - `check_email_exists`: Checks if an email exists in auth.users table
    
  2. Security
    - Function is accessible to authenticated and anon users
    - Only returns boolean result, no sensitive data exposed
*/

CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_to_check
  );
END;
$$;