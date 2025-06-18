import { CreateCouponDto, ValidateCouponResponse } from '@/types/coupon';

const API_BASE_URL = '/api/coupons';

export const couponService = {
  // Create a new coupon (admin only)
  async createCoupon(couponData: CreateCouponDto, token: string): Promise<ValidateCouponResponse> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(couponData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create coupon');
    }
    
    return response.json();
  },

  // Validate a coupon code
  async validateCoupon(code: string): Promise<ValidateCouponResponse> {
    const response = await fetch(`${API_BASE_URL}/validate?code=${encodeURIComponent(code)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate coupon');
    }
    
    return response.json();
  },

  // Get all coupons (admin only)
  async getCoupons(token: string): Promise<ValidateCouponResponse[]> {
    const response = await fetch(API_BASE_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch coupons');
    }
    
    return response.json();
  },

  // Update a coupon (admin only)
  async updateCoupon(id: string, updates: Partial<CreateCouponDto>, token: string): Promise<ValidateCouponResponse> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update coupon');
    }
    
    return response.json();
  },

  // Delete a coupon (admin only)
  async deleteCoupon(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete coupon');
    }
  }
};
