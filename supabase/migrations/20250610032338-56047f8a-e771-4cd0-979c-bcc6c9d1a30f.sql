
-- Create table for candidates/registrations
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  cin TEXT NOT NULL,
  center_number TEXT,
  center_name TEXT,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  location TEXT NOT NULL,
  exam_level TEXT NOT NULL CHECK (exam_level IN ('CGCE_ORDINARY_LEVEL', 'CGCE_ADVANCED_LEVEL')),
  department TEXT NOT NULL CHECK (department IN ('science', 'arts', 'commercial', 'technical')),
  subjects_and_grades JSONB NOT NULL DEFAULT '{}',
  services JSONB NOT NULL DEFAULT '{}',
  total_cost INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  document_verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (document_verification_status IN ('pending', 'verified', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for document uploads
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('timetable', 'national_id', 'birth_certificate')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for payments
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
  payer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('MTN_MOBILE_MONEY', 'ORANGE_MONEY')),
  amount INTEGER NOT NULL,
  transaction_id TEXT,
  payment_screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create table for admin users
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for registrations (public read for now, we'll add auth later)
CREATE POLICY "Anyone can create registrations" 
  ON public.registrations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view registrations" 
  ON public.registrations 
  FOR SELECT 
  USING (true);

-- RLS Policies for documents
CREATE POLICY "Anyone can upload documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view documents" 
  ON public.documents 
  FOR SELECT 
  USING (true);

-- RLS Policies for payments
CREATE POLICY "Anyone can create payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view payments" 
  ON public.payments 
  FOR SELECT 
  USING (true);

-- RLS Policies for admin users (only authenticated users can access)
CREATE POLICY "Only authenticated users can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false);

-- Storage policies for documents bucket
CREATE POLICY "Anyone can upload documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can view documents" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'documents');
