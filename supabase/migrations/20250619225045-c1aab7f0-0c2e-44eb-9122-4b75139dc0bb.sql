
-- Enable RLS on all tables if not already enabled
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create admin role check function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
FOR ALL USING (public.is_admin());

-- Admin policies for payments
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments" ON public.payments
FOR ALL USING (public.is_admin());

-- Admin policies for registrations
DROP POLICY IF EXISTS "Admins can manage registrations" ON public.registrations;
CREATE POLICY "Admins can manage registrations" ON public.registrations
FOR ALL USING (public.is_admin());

-- Admin policies for documents
DROP POLICY IF EXISTS "Admins can manage documents" ON public.documents;
CREATE POLICY "Admins can manage documents" ON public.documents
FOR ALL USING (public.is_admin());

-- Create storage bucket for uploads if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for admin access
DROP POLICY IF EXISTS "Admins can manage all files" ON storage.objects;
CREATE POLICY "Admins can manage all files" ON storage.objects
FOR ALL USING (bucket_id = 'uploads' AND public.is_admin());

-- Public read access for uploads bucket
DROP POLICY IF EXISTS "Public read access to uploads" ON storage.objects;
CREATE POLICY "Public read access to uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');
