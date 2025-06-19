
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { couponService } from '@/services/couponService';
import { Coupon, CreateCouponDto, CouponType, ValidateCouponResponse } from '@/types/coupon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type ApiCoupon = Omit<Coupon, 'validFrom' | 'validUntil' | 'createdAt' | 'updatedAt'> & {
  validFrom: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  coupon?: Coupon;
};

const mapApiCoupon = (coupon: ApiCoupon): Coupon => ({
  ...coupon,
  validFrom: new Date(coupon.validFrom),
  validUntil: new Date(coupon.validUntil),
  createdAt: new Date(coupon.createdAt),
  updatedAt: new Date(coupon.updatedAt),
  ...(coupon.coupon || {})
});

export default function CouponManager() {
  const { user, isLoading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<ApiCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState<CreateCouponDto>({
    code: '',
    discount: 10,
    type: 'percentage',
    maxUses: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const token = await user?.getIdToken();
      if (token) {
        const data = await couponService.getCoupons(token);
        const couponsArray = Array.isArray(data) 
          ? data 
          : data.coupon 
            ? [data.coupon] 
            : [];
        setCoupons(couponsArray);
      }
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
    if (user) {
      fetchCoupons();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCoupon(prev => ({
      ...prev,
      [name]: name === 'discount' || name === 'maxUses' ? Number(value) : value
    }));
  };

  const handleTypeChange = (value: CouponType) => {
    setNewCoupon(prev => ({
      ...prev,
      type: value,
      discount: value === 'percentage' ? 10 : 5000
    }));
  };

  const handleDateChange = (field: 'validFrom' | 'validUntil', value: string) => {
    setNewCoupon(prev => ({
      ...prev,
      [field]: new Date(value)
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

    const couponData: CreateCouponDto = {
      ...newCoupon,
      validFrom: newCoupon.validFrom.toISOString(),
      validUntil: newCoupon.validUntil.toISOString(),
    };

    try {
      setIsCreating(true);
      const token = await user.getIdToken();
      await couponService.createCoupon(couponData, token);
      
      toast({
        title: 'Success',
        description: 'Coupon created successfully',
        variant: 'default'
      });
      
      setNewCoupon({
        code: '',
        discount: 10,
        type: 'percentage',
        maxUses: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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

  const toggleCouponStatus = async (coupon: ApiCoupon) => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      await couponService.updateCoupon(
        coupon.id,
        { isActive: !coupon.isActive },
        token
      );
      
      toast({
        title: 'Success',
        description: `Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully`,
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
      const token = await user.getIdToken();
      await couponService.deleteCoupon(id, token);
      
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
                      value={newCoupon.type} 
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
                    <Label htmlFor="discount">
                      {newCoupon.type === 'percentage' ? 'Discount (%)' : 'Discount (XAF)'}
                    </Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      min={1}
                      max={newCoupon.type === 'percentage' ? 100 : 100000}
                      value={newCoupon.discount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="maxUses">Max Uses (0 for unlimited)</Label>
                  <Input
                    id="maxUses"
                    name="maxUses"
                    type="number"
                    min={0}
                    value={newCoupon.maxUses}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                      id="validFrom"
                      type="datetime-local"
                      value={newCoupon.validFrom ? format(new Date(newCoupon.validFrom), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => handleDateChange('validFrom', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="datetime-local"
                      value={newCoupon.validUntil ? format(new Date(newCoupon.validUntil), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => handleDateChange('validUntil', e.target.value)}
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
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
                      {coupons.map((coupon) => {
                        const mappedCoupon = mapApiCoupon(coupon);
                        return (
                          <TableRow key={mappedCoupon.id}>
                            <TableCell className="font-mono font-semibold">{mappedCoupon.code}</TableCell>
                            <TableCell>{mappedCoupon.type === 'percentage' ? '%' : 'XAF'}</TableCell>
                            <TableCell>
                              {mappedCoupon.type === 'percentage' 
                                ? `${mappedCoupon.discount}%` 
                                : `${mappedCoupon.discount.toLocaleString()} XAF`}
                            </TableCell>
                            <TableCell>
                              {mappedCoupon.maxUses === 0 
                                ? '∞' 
                                : `${mappedCoupon.usedCount} / ${mappedCoupon.maxUses}`}
                            </TableCell>
                            <TableCell>
                              {format(mappedCoupon.validUntil, 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                mappedCoupon.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {mappedCoupon.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleCouponStatus(coupon)}
                                >
                                  {mappedCoupon.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteCoupon(mappedCoupon.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
