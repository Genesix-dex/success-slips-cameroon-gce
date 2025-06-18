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
  const { id } = req.query;

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // PATCH /api/coupons/[id] - Update a coupon (admin only)
  if (req.method === 'PATCH') {
    try {
      const updates: Partial<CreateCouponDto> = req.body;

      // Find the coupon first to verify ownership
      const existingCoupon = await prisma.coupon.findUnique({
        where: { id: id as string },
      });

      if (!existingCoupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      // Verify the user is the creator of the coupon
      if (existingCoupon.createdBy !== session.user?.email) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Update the coupon
      const updatedCoupon = await prisma.coupon.update({
        where: { id: id as string },
        data: {
          ...(updates.code && { code: updates.code }),
          ...(updates.discount !== undefined && { discount: updates.discount }),
          ...(updates.type && { type: updates.type }),
          ...(updates.maxUses !== undefined && { maxUses: updates.maxUses }),
          ...(updates.validFrom && { validFrom: new Date(updates.validFrom) }),
          ...(updates.validUntil && { validUntil: new Date(updates.validUntil) }),
          ...(updates.isActive !== undefined && { isActive: updates.isActive }),
        },
      });

      return res.status(200).json(formatCoupon(updatedCoupon));
    } catch (error) {
      console.error('Error updating coupon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // DELETE /api/coupons/[id] - Delete a coupon (admin only)
  if (req.method === 'DELETE') {
    try {
      // Find the coupon first to verify ownership
      const existingCoupon = await prisma.coupon.findUnique({
        where: { id: id as string },
      });

      if (!existingCoupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      // Verify the user is the creator of the coupon
      if (existingCoupon.createdBy !== session.user?.email) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Delete the coupon
      await prisma.coupon.delete({
        where: { id: id as string },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
