-- Create or replace function to check roles
CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = role_name
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Main migration script
DO $$
BEGIN
  -- Create user_roles table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    CREATE TABLE public.user_roles (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users(id) on delete cascade,
      role text not null,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      constraint user_roles_user_id_role_key unique (user_id, role)
    );
    
    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
    
    -- Enable RLS on user_roles
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Created user_roles table and enabled RLS';
  ELSE
    RAISE NOTICE 'user_roles table already exists, skipping creation';
  END IF;

  -- Set up RLS policies for user_roles
  -- Only proceed if the table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles' AND rowsecurity) THEN
      ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Read access for users' own roles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Enable read access for users own roles') THEN
      CREATE POLICY "Enable read access for users own roles"
      ON public.user_roles FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    END IF;
    
    -- Read access for admins
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Enable read access for admins') THEN
      CREATE POLICY "Enable read access for admins"
      ON public.user_roles FOR SELECT
      TO authenticated
      USING (public.has_role('admin'));
    END IF;
    
    -- Insert for admins
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Enable insert for admins') THEN
      CREATE POLICY "Enable insert for admins"
      ON public.user_roles FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role('admin'));
    END IF;
    
    -- Update for admins
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Enable update for admins') THEN
      CREATE POLICY "Enable update for admins"
      ON public.user_roles FOR UPDATE
      TO authenticated
      USING (public.has_role('admin'))
      WITH CHECK (public.has_role('admin'));
    END IF;
    
    -- Delete for admins
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Enable delete for admins') THEN
      CREATE POLICY "Enable delete for admins"
      ON public.user_roles FOR DELETE
      TO authenticated
      USING (public.has_role('admin'));
    END IF;
    
    RAISE NOTICE 'Ensured all RLS policies for user_roles';
  END IF;

  -- Create or replace the handle_new_user function
  BEGIN
    CREATE OR REPLACE FUNCTION public.handle_new_user() 
    RETURNS trigger AS $$
    BEGIN
      -- Add default role for new users
      INSERT INTO public.user_roles (user_id, role)
      VALUES (new.id, 'user');
      
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    RAISE NOTICE 'Created/updated handle_new_user function';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating handle_new_user function: %', SQLERRM;
  END;

  -- Create the trigger if it doesn't exist
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
      
      RAISE NOTICE 'Created on_auth_user_created trigger';
    ELSE
      RAISE NOTICE 'on_auth_user_created trigger already exists, skipping creation';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating trigger: %', SQLERRM;
  END;

END $$;
