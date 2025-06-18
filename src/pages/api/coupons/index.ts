import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { CreateCouponDto, Coupon } from '@/types/coupon';

const prisma = new PrismaClient();

// Helper function to format coupon for response
const formatCoupon = (coupon: any): Coupon => ({
  id: coupon.id,
  code: coupon.code,
  discount: Number(coupon.discount),
  type: coupon.type as 'percentage' | 'fixed',
  maxUses: coupon.maxUses,
  usedCount: coupon.usedCount,
  validFrom: new Date(coupon.validFrom),
  validUntil: new Date(coupon.validUntil),
  isActive: coupon.isActive,
  createdAt: new Date(coupon.createdAt),
  updatedAt: new Date(coupon.updatedAt),
  createdBy: coupon.createdBy
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // GET /api/coupons - Get all coupons (admin only)
  if (req.method === 'GET') {
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const coupons = await prisma.coupon.findMany({
        where: {
          createdBy: session.user?.email || '',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(coupons.map(formatCoupon));
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // POST /api/coupons - Create a new coupon (admin only)
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const couponData: CreateCouponDto = req.body;

    // Validate request body
    if (!couponData.code || !couponData.discount || !couponData.type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      // Check if coupon code already exists
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: couponData.code },
      });

      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }

      // Create new coupon
      const newCoupon = await prisma.coupon.create({
        data: {
          code: couponData.code,
          discount: couponData.discount,
          type: couponData.type,
          maxUses: couponData.maxUses || 0,
          validFrom: couponData.validFrom ? new Date(couponData.validFrom) : new Date(),
          validUntil: couponData.validUntil ? new Date(couponData.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          isActive: true,
          createdBy: session.user?.email || '',
          usedCount: 0,
        },
      });

      return res.status(201).json(formatCoupon(newCoupon));
    } catch (error) {
      console.error('Error creating coupon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
