-- Migration: fix_user_creation_trigger
-- Created at: 1765785630

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS docautofill_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS docautofill_handle_new_user();

-- Create a new function with security definer to bypass RLS
CREATE OR REPLACE FUNCTION docautofill_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.docautofill_user_settings (user_id)
  VALUES (new.id);
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in docautofill_handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER docautofill_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION docautofill_handle_new_user();;