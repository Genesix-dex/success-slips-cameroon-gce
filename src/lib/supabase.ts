
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wdmuywmrswutxvkxqtxx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbXV5d21yc3d1dHh2a3hxdHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjE2MjEsImV4cCI6MjA2NTA5NzYyMX0.ZEqYKhv9goMsNEv7NagrmfAX2Yiz75KmMjyrEsl1HnM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for admin operations
export const adminApi = {
  // User management
  createUser: async (email: string, password: string, role: string) => {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
      },
    });

    if (error) throw error;
    return data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        role,
      },
    });

    if (error) throw error;
    return data;
  },

  deleteUser: async (userId: string) => {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
  },

  // Coupon management
  createCoupon: async (coupon: any) => {
    const { data, error } = await supabase
      .from('coupons')
      .insert([coupon])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateCoupon: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteCoupon: async (id: string) => {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Submission management
  getSubmissions: async (filters: any = {}) => {
    let query = supabase.from('submissions').select('*');
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }
    if (filters.department) {
      query = query.eq('department', filters.department);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  updateSubmission: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Payment management
  getPayments: async (filters: any = {}) => {
    let query = supabase.from('payments').select('*');
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.email) {
      query = query.eq('user_id', filters.email);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  updatePayment: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // File management
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;
    return data;
  },

  getFileUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  deleteFile: async (path: string, bucket: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  },
};
