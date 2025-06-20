
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { couponApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type CouponType = 'percentage' | 'fixed';

interface CreateCouponDto {
  code: string;
  discount_value: number;
  discount_type: CouponType;
  max_uses: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

interface Coupon extends CreateCouponDto {
  id: string;
  used_count: number;
  created_at: string;
  created_by: string | null;
}

export default function CouponManager() {
  const { user, isLoading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState<CreateCouponDto>({
    code: '',
    discount_value: 10,
    discount_type: 'percentage',
    max_uses: 100,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  });

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await couponApi.getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load coupons',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCoupon(prev => ({
      ...prev,
      [name]: name === 'discount_value' || name === 'max_uses' ? Number(value) : value
    }));
  };

  const handleTypeChange = (value: CouponType) => {
    setNewCoupon(prev => ({
      ...prev,
      discount_type: value,
      discount_value: value === 'percentage' ? 10 : 5000
    }));
  };

  const handleDateChange = (field: 'valid_from' | 'valid_until', value: string) => {
    setNewCoupon(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create coupons',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsCreating(true);
      await couponApi.createCoupon(newCoupon);
      
      toast({
        title: 'Success',
        description: 'Coupon created successfully',
        variant: 'default'
      });
      
      setNewCoupon({
        code: '',
        discount_value: 10,
        discount_type: 'percentage',
        max_uses: 100,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      });
      
      await fetchCoupons();
    } catch (error) {
      console.error('Failed to create coupon:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create coupon',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    if (!user) return;
    
    try {
      await couponApi.updateCoupon(coupon.id, { is_active: !coupon.is_active });
      
      toast({
        title: 'Success',
        description: `Coupon ${coupon.is_active ? 'deactivated' : 'activated'} successfully`,
        variant: 'default'
      });
      
      await fetchCoupons();
    } catch (error) {
      console.error('Failed to update coupon:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update coupon',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }
    
    try {
      await couponApi.deleteCoupon(id);
      
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully',
        variant: 'default'
      });
      
      await fetchCoupons();
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete coupon',
        variant: 'destructive'
      });
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>You must be logged in to access this page</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create New Coupon</CardTitle>
            <CardDescription>Generate a new discount code</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="code">Code</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="code"
                        name="code"
                        value={newCoupon.code}
                        onChange={handleInputChange}
                        placeholder="e.g., SUMMER20"
                        required
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setNewCoupon(prev => ({ ...prev, code: generateCode() }))}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={newCoupon.discount_type} 
                      onValueChange={handleTypeChange}
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
                  
                  <div>
                    <Label htmlFor="discount_value">
                      {newCoupon.discount_type === 'percentage' ? 'Discount (%)' : 'Discount (XAF)'}
                    </Label>
                    <Input
                      id="discount_value"
                      name="discount_value"
                      type="number"
                      min={1}
                      max={newCoupon.discount_type === 'percentage' ? 100 : 100000}
                      value={newCoupon.discount_value}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="max_uses">Max Uses (0 for unlimited)</Label>
                  <Input
                    id="max_uses"
                    name="max_uses"
                    type="number"
                    min={0}
                    value={newCoupon.max_uses || 0}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valid_from">Valid From</Label>
                    <Input
                      id="valid_from"
                      type="date"
                      value={newCoupon.valid_from}
                      onChange={(e) => handleDateChange('valid_from', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={newCoupon.valid_until}
                      onChange={(e) => handleDateChange('valid_until', e.target.value)}
                      min={newCoupon.valid_from}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Coupon'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Coupons</CardTitle>
              <CardDescription>Manage existing discount codes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No coupons found. Create your first coupon to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                          <TableCell>{coupon.discount_type === 'percentage' ? '%' : 'XAF'}</TableCell>
                          <TableCell>
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.discount_value}%` 
                              : `${coupon.discount_value.toLocaleString()} XAF`}
                          </TableCell>
                          <TableCell>
                            {coupon.max_uses === 0 || coupon.max_uses === null
                              ? '∞' 
                              : `${coupon.used_count} / ${coupon.max_uses}`}
                          </TableCell>
                          <TableCell>
                            {format(new Date(coupon.valid_until), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              coupon.is_active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {coupon.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCouponStatus(coupon)}
                              >
                                {coupon.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteCoupon(coupon.id)}
                              >
                                Delete
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
      </div>
    </div>
  );
}
