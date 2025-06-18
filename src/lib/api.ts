
import { supabase } from '@/integrations/supabase/client';

// Types
type Coupon = {
  id: string;
  code: string;
  discount_value: number;
  discount_type: 'percentage' | 'fixed';
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
};

type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user' | 'support';
  created_at: string;
};

type Submission = {
  id: string;
  full_name: string;
  cin: string;
  exam_level: string;
  department: string;
  document_verification_status: 'pending' | 'verified' | 'rejected';
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  documents: Array<{
    id: string;
    document_type: string;
    file_url: string;
  }>;
};

type Payment = {
  id: string;
  registration_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id: string;
  payer_name: string;
  phone_number: string;
  created_at: string;
};

type UploadedFile = {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  document_type: string;
  uploaded_at: string;
  registration_id: string;
};

// Coupon API
export const couponApi = {
  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Coupon[];
  },

  async createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'created_by'>): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .insert([coupon])
      .select()
      .single();
    
    if (error) throw error;
    return data as Coupon;
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Coupon;
  },

  async deleteCoupon(id: string): Promise<void> {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// User API
export const userApi = {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as User[];
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Submission API
export const submissionApi = {
  async getSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        documents (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Submission[];
  },

  async updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission> {
    const { data, error } = await supabase
      .from('registrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Submission;
  },
};

// Payment API
export const paymentApi = {
  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Payment[];
  },

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Payment;
  },
};

// File API
export const fileApi = {
  async getFiles(): Promise<UploadedFile[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data as UploadedFile[];
  },

  async deleteFile(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Dashboard Stats
export const dashboardApi = {
  async getStats() {
    const [
      { count: registrations },
      { count: payments },
      { count: documents },
      { count: coupons },
    ] = await Promise.all([
      supabase.from('registrations').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }),
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      supabase.from('coupons').select('*', { count: 'exact', head: true }),
    ]);

    const { data: completedPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = completedPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    return {
      users: registrations || 0,
      submissions: registrations || 0,
      revenue: totalRevenue,
      activeCoupons: coupons || 0,
    };
  },
};
