import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { ValidateCouponResponse } from '@/types/coupon';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidateCouponResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      isValid: false, 
      message: 'Method not allowed' 
    });
  }

  const { code } = req.query;

  // Validate code parameter
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ 
      isValid: false, 
      message: 'Coupon code is required' 
    });
  }

  try {
    // Find the coupon in the database
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    const now = new Date();

    // Check if coupon exists
    if (!coupon) {
      return res.status(200).json({ 
        isValid: false, 
        message: 'Invalid coupon code' 
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(200).json({ 
        isValid: false, 
        message: 'This coupon is no longer active' 
      });
    }

    // Check if coupon has expired
    if (new Date(coupon.validUntil) < now) {
      return res.status(200).json({ 
        isValid: false, 
        message: 'This coupon has expired' 
      });
    }

    // Check if coupon has reached max uses
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return res.status(200).json({ 
        isValid: false, 
        message: 'This coupon has reached its maximum usage limit' 
      });
    }

    // Check if coupon is valid for current date
    if (new Date(coupon.validFrom) > now) {
      return res.status(200).json({ 
        isValid: false, 
        message: 'This coupon is not yet valid' 
      });
    }

    // If all checks pass, return valid coupon
    return res.status(200).json({
      isValid: true,
      coupon: {
        code: coupon.code,
        discount: Number(coupon.discount),
        type: coupon.type as 'percentage' | 'fixed',
        maxUses: coupon.maxUses,
        validFrom: new Date(coupon.validFrom),
        validUntil: new Date(coupon.validUntil),
        isActive: coupon.isActive
      }
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(500).json({ 
      isValid: false, 
      message: 'An error occurred while validating the coupon' 
    });
  }
}
