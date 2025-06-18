import { supabase } from './supabase';

// Types
type Coupon = {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
};

type User = {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user' | 'support';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string | null;
  createdAt: string;
  loginCount: number;
};

type Submission = {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  examLevel: string;
  department: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
  documents: Array<{
    id: string;
    type: string;
    url: string;
  }>;
};

type Payment = {
  id: string;
  reference: string;
  submissionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: string;
  transactionId: string;
  paidAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
};

type UploadedFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  referenceId: string;
  referenceType: 'submission' | 'payment' | 'other';
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

  async createCoupon(coupon: Omit<Coupon, 'id' | 'createdAt' | 'createdBy'>): Promise<Coupon> {
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
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as User[];
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Submission API
export const submissionApi = {
  async getSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
      .from('submissions')
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
      .from('submissions')
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
      .select(`
        *,
        user:user_id (id, email, full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as any[]).map(payment => ({
      ...payment,
      user: {
        id: payment.user.id,
        email: payment.user.email,
        fullName: payment.user.full_name,
      },
    })) as Payment[];
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
      .from('files')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data as UploadedFile[];
  },

  async deleteFile(id: string): Promise<void> {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Dashboard Stats
export const dashboardApi = {
  async getStats() {
    const [
      { count: users },
      { count: submissions },
      { count: payments },
      { count: coupons },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('submissions').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }),
      supabase.from('coupons').select('*', { count: 'exact', head: true, where: { is_active: true } }),
    ]);

    const { data: revenueData } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    return {
      users: users || 0,
      submissions: submissions || 0,
      revenue: totalRevenue,
      activeCoupons: coupons || 0,
    };
  },
};
