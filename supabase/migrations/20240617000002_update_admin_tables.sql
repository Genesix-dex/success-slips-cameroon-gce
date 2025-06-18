-- This migration updates existing tables and adds new ones if they don't exist

-- 1. First, create the user_roles table if it doesn't exist
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint user_roles_user_id_role_key unique (user_id, role)
);

-- Create index for faster lookups
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);

-- Enable RLS on user_roles if not already enabled
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'user_roles' and policyname = 'Enable read access for users own roles') then
    -- RLS Policies for user_roles
    alter table public.user_roles enable row level security;
    
    create policy "Enable read access for users own roles"
    on public.user_roles for select
    to authenticated
    using (auth.uid() = user_id);

    create policy "Enable read access for admins"
    on public.user_roles for select
    to authenticated
    using (public.has_role('admin'));

    create policy "Enable insert for admins"
    on public.user_roles for insert
    to authenticated
    with check (public.has_role('admin'));

    create policy "Enable update for admins"
    on public.user_roles for update
    to authenticated
    using (public.has_role('admin'))
    with check (public.has_role('admin'));

    create policy "Enable delete for admins"
    on public.user_roles for delete
    to authenticated
    using (public.has_role('admin'));
  end if;
end $$;

-- 2. Create coupons table if it doesn't exist
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

-- 3. Create file_metadata table if it doesn't exist
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

-- 4. Set up RLS for coupons if not already set up
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'coupons' and policyname = 'Enable read access for authenticated users') then
    alter table public.coupons enable row level security;
    
    create policy "Enable read access for authenticated users"
    on public.coupons for select
    to authenticated
    using (true);

    create policy "Enable insert for admins"
    on public.coupons for insert
    to authenticated
    with check (public.has_role('admin'));

    create policy "Enable update for admins"
    on public.coupons for update
    to authenticated
    using (public.has_role('admin'))
    with check (public.has_role('admin'));

    create policy "Enable delete for admins"
    on public.coupons for delete
    to authenticated
    using (public.has_role('admin'));
  end if;
end $$;

-- 5. Set up RLS for file_metadata if not already set up
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'file_metadata' and policyname = 'Enable read access for authenticated users on file_metadata') then
    alter table public.file_metadata enable row level security;
    
    create policy "Enable read access for authenticated users on file_metadata"
    on public.file_metadata for select
    to authenticated
    using (true);

    create policy "Enable insert for authenticated users on file_metadata"
    on public.file_metadata for insert
    to authenticated
    with check (true);

    create policy "Enable update for admins on file_metadata"
    on public.file_metadata for update
    to authenticated
    using (public.has_role('admin'))
    with check (public.has_role('admin'));

    create policy "Enable delete for admins on file_metadata"
    on public.file_metadata for delete
    to authenticated
    using (public.has_role('admin'));
  end if;
end $$;

-- 6. Create storage bucket for uploads if it doesn't exist
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- 7. Set up storage policies if they don't exist
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Public Access') then
    create policy "Public Access"
    on storage.objects for select
    using (bucket_id = 'uploads');
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Enable insert for authenticated users on storage') then
    create policy "Enable insert for authenticated users on storage"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'uploads');
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Enable update for authenticated users on storage') then
    create policy "Enable update for authenticated users on storage"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'uploads');
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Enable delete for admins on storage') then
    create policy "Enable delete for admins on storage"
    on storage.objects for delete
    to authenticated
    using (
      bucket_id = 'uploads' and
      public.has_role('admin')
    );
  end if;
end $$;

-- 8. Create has_role function if it doesn't exist
create or replace function public.has_role(role_name text)
returns boolean as $$
  select exists (
    select 1 from public.user_roles 
    where user_id = auth.uid() 
    and role = role_name
  );
$$ language sql security definer;
