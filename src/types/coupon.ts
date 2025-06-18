export type CouponType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: CouponType;
  maxUses?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateCouponDto {
  code: string;
  discount: number;
  type: CouponType;
  maxUses?: number;
  validFrom?: Date | string;
  validUntil?: Date | string;
}

export interface ValidateCouponResponse {
  isValid: boolean;
  coupon?: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'usedCount'>;
  message?: string;
}
