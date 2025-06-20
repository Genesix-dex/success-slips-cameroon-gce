
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Search, Eye, Check, X, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Payment {
  id: string;
  registration_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  payer_name: string;
  phone_number: string;
  transaction_id?: string;
  payment_screenshot_url?: string;
  admin_notes?: string;
  created_at: string;
  verified_at?: string;
  registrations?: {
    full_name: string;
    email: string;
    cin: string;
  };
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payments from Supabase
  const { data: payments = [], isLoading, error } = useQuery<Payment[]>({
    queryKey: ['admin-payments', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select(`
          *,
          registrations!inner(
            full_name,
            email,
            cin
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Filter payments based on search
  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.payer_name.toLowerCase().includes(searchLower) ||
      payment.phone_number.includes(searchLower) ||
      payment.registrations?.full_name.toLowerCase().includes(searchLower) ||
      payment.registrations?.email.toLowerCase().includes(searchLower) ||
      payment.registrations?.cin.toLowerCase().includes(searchLower)
    );
  });

  // Update payment status mutation
  const updatePaymentStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updateData.verified_at = new Date().toISOString();
      }

      if (notes) {
        updateData.admin_notes = notes;
      }

      const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast({
        title: 'Payment updated',
        description: `Payment has been ${data.status === 'completed' ? 'approved' : 'rejected'} successfully.`,
      });
      setSelectedPayment(null);
      setAdminNotes('');
    },
    onError: (error) => {
      console.error('Payment update failed:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update payment status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleApprovePayment = (payment: Payment) => {
    updatePaymentStatus.mutate({
      id: payment.id,
      status: 'completed',
      notes: adminNotes || undefined,
    });
  };

  const handleRejectPayment = (payment: Payment) => {
    updatePaymentStatus.mutate({
      id: payment.id,
      status: 'failed',
      notes: adminNotes || 'Payment rejected by admin',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pending', variant: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Approved', variant: 'bg-green-100 text-green-800' },
      failed: { label: 'Rejected', variant: 'bg-red-100 text-red-800' },
      refunded: { label: 'Refunded', variant: 'bg-blue-100 text-blue-800' },
    } as const;

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const csvData = filteredPayments.map(payment => ({
      'Payment ID': payment.id,
      'Payer Name': payment.payer_name,
      'Phone': payment.phone_number,
      'Amount': payment.amount,
      'Status': payment.status,
      'Method': payment.payment_method,
      'Transaction ID': payment.transaction_id || '',
      'Candidate Name': payment.registrations?.full_name || '',
      'Candidate Email': payment.registrations?.email || '',
      'CIN': payment.registrations?.cin || '',
      'Created': format(new Date(payment.created_at), 'yyyy-MM-dd HH:mm'),
      'Admin Notes': payment.admin_notes || '',
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">Error loading payments: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">
            Review and approve candidate payments
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={filteredPayments.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search payments..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Approved</option>
            <option value="failed">Rejected</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size={32} />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No payments match your filters.' 
                  : 'No payments found.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payer Details</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.payer_name}</div>
                          <div className="text-sm text-muted-foreground">{payment.phone_number}</div>
                          {payment.transaction_id && (
                            <div className="text-xs text-muted-foreground">
                              TxID: {payment.transaction_id}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.registrations?.full_name}</div>
                          <div className="text-sm text-muted-foreground">{payment.registrations?.email}</div>
                          <div className="text-xs text-muted-foreground">CIN: {payment.registrations?.cin}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${payment.amount}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {payment.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(payment.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setAdminNotes(payment.admin_notes || '');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Review</DialogTitle>
                            </DialogHeader>
                            {selectedPayment && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Payer Name</label>
                                    <p className="text-sm text-muted-foreground">{selectedPayment.payer_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Amount</label>
                                    <p className="text-sm text-muted-foreground">${selectedPayment.amount}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <p className="text-sm text-muted-foreground">{selectedPayment.phone_number}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Payment Method</label>
                                    <p className="text-sm text-muted-foreground capitalize">{selectedPayment.payment_method}</p>
                                  </div>
                                </div>

                                {selectedPayment.payment_screenshot_url && (
                                  <div>
                                    <label className="text-sm font-medium">Payment Screenshot</label>
                                    <div className="mt-2">
                                      <img
                                        src={selectedPayment.payment_screenshot_url}
                                        alt="Payment screenshot"
                                        className="max-w-full h-auto rounded-lg border"
                                        style={{ maxHeight: '300px' }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <label className="text-sm font-medium">Admin Notes</label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this payment..."
                                    className="mt-1"
                                  />
                                </div>

                                {selectedPayment.status === 'pending' && (
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      onClick={() => handleApprovePayment(selectedPayment)}
                                      disabled={updatePaymentStatus.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      {updatePaymentStatus.isPending ? (
                                        <LoadingSpinner size={16} className="mr-2" />
                                      ) : (
                                        <Check className="mr-2 h-4 w-4" />
                                      )}
                                      Approve Payment
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleRejectPayment(selectedPayment)}
                                      disabled={updatePaymentStatus.isPending}
                                    >
                                      {updatePaymentStatus.isPending ? (
                                        <LoadingSpinner size={16} className="mr-2" />
                                      ) : (
                                        <X className="mr-2 h-4 w-4" />
                                      )}
                                      Reject Payment
                                    </Button>
                                  </div>
                                )}

                                {selectedPayment.status !== 'pending' && (
                                  <div className="pt-4">
                                    <p className="text-sm text-muted-foreground">
                                      This payment has been {selectedPayment.status === 'completed' ? 'approved' : 'rejected'}.
                                      {selectedPayment.verified_at && (
                                        <span className="block">
                                          Action taken on: {format(new Date(selectedPayment.verified_at), 'PPp')}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
