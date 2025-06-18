-- Enable Row Level Security if not already enabled
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coupons') AND 
     NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coupons' AND rowsecurity) THEN
    ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'file_metadata') AND 
     NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'file_metadata' AND rowsecurity) THEN
    ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Coupons table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_value numeric(10, 2) not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  max_uses integer,
  used_count integer default 0,
  valid_from timestamp with time zone not null default now(),
  valid_until timestamp with time zone not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint valid_discount check (
    (discount_type = 'percentage' and discount_value between 0 and 100) or
    (discount_type = 'fixed' and discount_value > 0)
  )
);

-- File metadata table
create table if not exists public.file_metadata (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  mime_type text not null,
  size_bytes bigint not null,
  reference_id text,
  reference_type text check (reference_type in ('submission', 'payment', 'other')),
  uploaded_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_coupons_code on public.coupons (code);
create index if not exists idx_coupons_active on public.coupons (is_active) where is_active = true;
create index if not exists idx_file_metadata_reference on public.file_metadata (reference_id, reference_type);

-- RLS Policies for Coupons
DO $$
BEGIN
  -- Only create policies if the coupons table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coupons') THEN
    -- Read access policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'coupons' AND policyname = 'Enable read access for authenticated users') THEN
      CREATE POLICY "Enable read access for authenticated users"
      ON public.coupons FOR SELECT
      TO authenticated
      USING (true);
    END IF;
    
    -- Insert policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'coupons' AND policyname = 'Enable insert for admins') THEN
      CREATE POLICY "Enable insert for admins"
      ON public.coupons FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role('admin'));
    END IF;
    
    -- Update policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'coupons' AND policyname = 'Enable update for admins') THEN
      CREATE POLICY "Enable update for admins"
      ON public.coupons FOR UPDATE
      TO authenticated
      USING (public.has_role('admin'))
      WITH CHECK (public.has_role('admin'));
    END IF;
    
    -- Delete policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'coupons' AND policyname = 'Enable delete for admins') THEN
      CREATE POLICY "Enable delete for admins"
      ON public.coupons FOR DELETE
      TO authenticated
      USING (public.has_role('admin'));
    END IF;
  END IF;
END $$;

-- RLS Policies for File Metadata
DO $$
BEGIN
  -- Only create policies if the file_metadata table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'file_metadata') THEN
    -- Read access policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'file_metadata' AND policyname = 'Enable read access for authenticated users on file_metadata') THEN
      CREATE POLICY "Enable read access for authenticated users on file_metadata"
      ON public.file_metadata FOR SELECT
      TO authenticated
      USING (true);
    END IF;
    
    -- Insert policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'file_metadata' AND policyname = 'Enable insert for authenticated users on file_metadata') THEN
      CREATE POLICY "Enable insert for authenticated users on file_metadata"
      ON public.file_metadata FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role('authenticated'));
    END IF;
    
    -- Update policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'file_metadata' AND policyname = 'Enable update for admins on file_metadata') THEN
      CREATE POLICY "Enable update for admins on file_metadata"
      ON public.file_metadata FOR UPDATE
      TO authenticated
      USING (public.has_role('admin'))
      WITH CHECK (public.has_role('admin'));
    END IF;
    
    -- Delete policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'file_metadata' AND policyname = 'Enable delete for admins on file_metadata') THEN
      CREATE POLICY "Enable delete for admins on file_metadata"
      ON public.file_metadata FOR DELETE
      TO authenticated
      USING (public.has_role('admin'));
    END IF;
  END IF;
END $$;

-- Create storage bucket for uploads if it doesn't exist
DO $$
BEGIN
  -- Only proceed if the storage schema exists
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    -- Create the uploads bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('uploads', 'uploads', true)
    ON CONFLICT (id) DO NOTHING;
    
    -- Set up storage policies if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access') THEN
      CREATE POLICY "Public Access"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'uploads');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Enable insert for authenticated users on storage') THEN
      CREATE POLICY "Enable insert for authenticated users on storage"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'uploads');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Enable update for authenticated users on storage') THEN
      CREATE POLICY "Enable update for authenticated users on storage"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'uploads');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Enable delete for admins on storage') THEN
      CREATE POLICY "Enable delete for admins on storage"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'uploads' and
        public.has_role('admin')
      );
    END IF;
  END IF;
END $$;
