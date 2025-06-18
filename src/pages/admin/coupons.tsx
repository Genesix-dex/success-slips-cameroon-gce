import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';

interface Coupon {
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
}

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    code: `CODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    discount: 10,
    type: 'percentage' as 'percentage' | 'fixed',
    maxUses: 100,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Fetch coupons from Supabase
  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(coupon => ({
          id: coupon.id,
          code: coupon.code,
          discount: coupon.discount_value,
          type: coupon.discount_type,
          maxUses: coupon.max_uses || 0,
          usedCount: coupon.used_count || 0,
          validFrom: coupon.valid_from,
          validUntil: coupon.valid_until,
          isActive: coupon.is_active,
          createdAt: coupon.created_at,
          createdBy: coupon.created_by || 'system',
        }));
      } catch (err) {
        console.error('Error fetching coupons:', err);
        throw err;
      }
    },
  });

  // Create coupon mutation
  const createCoupon = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Replace with actual API call
      return new Promise<Coupon>((resolve) => {
        setTimeout(() => {
          resolve({
            id: Math.random().toString(36).substring(2, 9),
            ...data,
            usedCount: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'admin@example.com',
          });
        }, 1000);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsCreating(false);
      setFormData({
        code: `CODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        discount: 10,
        type: 'percentage',
        maxUses: 100,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      toast({
        title: 'Success',
        description: 'Coupon created successfully',
      });
    },
  });

  // Toggle coupon status
  const toggleCouponStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // Replace with actual API call
      return new Promise<Coupon>((resolve) => {
        setTimeout(() => {
          resolve({
            id,
            code: 'SAMPLE',
            discount: 10,
            type: 'percentage',
            maxUses: 100,
            usedCount: 0,
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: !isActive,
            createdAt: new Date().toISOString(),
            createdBy: 'admin@example.com',
          });
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });

  // Delete coupon
  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      // Replace with actual API call
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.discount <= 0) {
      toast({
        title: 'Invalid discount',
        description: 'Discount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(formData.validUntil) < new Date()) {
      toast({
        title: 'Invalid date',
        description: 'Expiration date must be in the future',
        variant: 'destructive',
      });
      return;
    }

    createCoupon.mutate(formData, {
      onError: (error) => {
        console.error('Failed to create coupon:', error);
        toast({
          title: 'Failed to create coupon',
          description: error.message || 'An error occurred',
          variant: 'destructive',
        });
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discount' || name === 'maxUses' ? Number(value) : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount coupons for your customers
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? 'Cancel' : 'New Coupon'}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Coupon</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'percentage' | 'fixed') =>
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">
                    Discount {formData.type === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                    value={formData.discount}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses (0 for unlimited)</Label>
                  <Input
                    id="maxUses"
                    name="maxUses"
                    type="number"
                    min="0"
                    value={formData.maxUses}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    name="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    name="validUntil"
                    type="date"
                    min={formData.validFrom}
                    value={formData.validUntil}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCoupon.isPending}>
                  {createCoupon.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Coupon'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No coupons found. Create your first coupon to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">
                        <div className="font-mono bg-muted px-2 py-1 rounded text-sm">
                          {coupon.code}
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.discount}
                        {coupon.type === 'percentage' ? '%' : '$'} off
                      </TableCell>
                      <TableCell>
                        {coupon.usedCount} / {coupon.maxUses === 0 ? '∞' : coupon.maxUses}
                      </TableCell>
                      <TableCell>
                        {format(new Date(coupon.validUntil), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            coupon.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toggleCouponStatus.mutate({
                                id: coupon.id,
                                isActive: coupon.isActive,
                              })
                            }
                            disabled={toggleCouponStatus.isPending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this coupon?')) {
                                deleteCoupon.mutate(coupon.id);
                              }
                            }}
                            disabled={deleteCoupon.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
