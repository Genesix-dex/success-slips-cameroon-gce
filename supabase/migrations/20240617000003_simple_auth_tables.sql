-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop existing policies if they exist
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- Simple RLS policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Add default role for new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DO $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error dropping trigger: %', SQLERRM;
END $$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add initial admin user (replace 'admin@example.com' with actual admin email)
-- This is a one-time operation that will only work if the auth.users table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users) THEN
    INSERT INTO auth.users (id, email, role, created_at, updated_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      'authenticated',
      now(),
      now()
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('00000000-0000-0000-0000-000000000000', 'admin');
    
    RAISE NOTICE 'Created initial admin user with email: admin@example.com';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating admin user: %', SQLERRM;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'Auth tables migration completed successfully';
END $$;