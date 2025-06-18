
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Search, Filter, Check, X, Clock, AlertCircle, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  reference: string;
  registrationId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: string;
  transactionId: string;
  createdAt: string;
  payerName: string;
  phoneNumber: string;
  adminNotes?: string;
  paymentScreenshotUrl?: string;
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payments from Supabase
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['payments', statusFilter],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            registrations!inner(full_name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(payment => ({
          id: payment.id,
          reference: `PAY-${payment.id.substring(0, 8).toUpperCase()}`,
          registrationId: payment.registration_id || '',
          amount: payment.amount || 0,
          status: payment.status || 'pending',
          method: payment.payment_method || 'unknown',
          transactionId: payment.transaction_id || 'N/A',
          createdAt: payment.created_at || new Date().toISOString(),
          payerName: payment.payer_name || 'Unknown',
          phoneNumber: payment.phone_number || 'N/A',
          adminNotes: payment.admin_notes || '',
          paymentScreenshotUrl: payment.payment_screenshot_url || '',
        }));
      } catch (err) {
        console.error('Error fetching payments:', err);
        throw err;
      }
    },
  });

  // Mutation for updating payment status
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ paymentId, status, notes }: { paymentId: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status, 
          admin_notes: notes,
          verified_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Updated',
        description: 'Payment status has been updated successfully.',
      });
      setSelectedPayment(null);
      setAdminNotes('');
    },
    onError: (error) => {
      console.error('Error updating payment:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update payment status.',
        variant: 'destructive',
      });
    },
  });

  const handleApprovePayment = (payment: Payment) => {
    updatePaymentMutation.mutate({
      paymentId: payment.id,
      status: 'completed',
      notes: adminNotes || 'Payment approved by admin'
    });
  };

  const handleRejectPayment = (payment: Payment) => {
    updatePaymentMutation.mutate({
      paymentId: payment.id,
      status: 'failed',
      notes: adminNotes || 'Payment rejected by admin'
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { 
        label: 'Pending', 
        icon: <Clock className="h-3 w-3 mr-1" />,
        variant: 'bg-yellow-100 text-yellow-800' 
      },
      completed: { 
        label: 'Completed', 
        icon: <Check className="h-3 w-3 mr-1" />,
        variant: 'bg-green-100 text-green-800' 
      },
      failed: { 
        label: 'Failed', 
        icon: <X className="h-3 w-3 mr-1" />,
        variant: 'bg-red-100 text-red-800' 
      },
      refunded: { 
        label: 'Refunded', 
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        variant: 'bg-purple-100 text-purple-800' 
      },
    } as const;

    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      icon: null,
      variant: 'bg-gray-100 text-gray-800' 
    };
    
    return (
      <Badge className={`inline-flex items-center ${statusInfo.variant}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const handleExport = async () => {
    try {
      const headers = [
        'Reference', 'Payer Name', 'Phone', 'Amount', 
        'Status', 'Method', 'Transaction ID', 'Created At'
      ];
      
      const csvContent = [
        headers.join(','),
        ...payments.map(payment => [
          `"${payment.reference}"`,
          `"${payment.payerName}"`,
          `"${payment.phoneNumber}"`,
          payment.amount,
          payment.status,
          payment.method,
          `"${payment.transactionId}"`,
          payment.createdAt
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `payments-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export successful',
        description: 'Payment data has been exported to CSV',
      });
    } catch (err) {
      console.error('Export failed:', err);
      toast({
        title: 'Export failed',
        description: 'Failed to export payment data',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payments Management</h1>
          <p className="text-muted-foreground">
            Review and approve payment transactions
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExport}
          className="self-start md:self-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
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
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
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
                    <TableHead>Reference</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <div className="font-mono text-sm">
                          {payment.reference}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{payment.payerName}</span>
                          <span className="text-xs text-muted-foreground">
                            {payment.phoneNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {payment.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {payment.transactionId || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setAdminNotes(payment.adminNotes || '');
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Review - {payment.reference}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Payer Name</label>
                                  <p className="text-sm text-muted-foreground">{payment.payerName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Phone Number</label>
                                  <p className="text-sm text-muted-foreground">{payment.phoneNumber}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Amount</label>
                                  <p className="text-sm text-muted-foreground">{formatCurrency(payment.amount)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Payment Method</label>
                                  <p className="text-sm text-muted-foreground capitalize">{payment.method}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Transaction ID</label>
                                  <p className="text-sm text-muted-foreground font-mono">{payment.transactionId}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Current Status</label>
                                  <div className="mt-1">{getStatusBadge(payment.status)}</div>
                                </div>
                              </div>

                              {payment.paymentScreenshotUrl && (
                                <div>
                                  <label className="text-sm font-medium">Payment Screenshot</label>
                                  <div className="mt-2">
                                    <img 
                                      src={payment.paymentScreenshotUrl} 
                                      alt="Payment Screenshot" 
                                      className="max-w-full h-48 object-contain border rounded"
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

                              {payment.status === 'pending' && (
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => handleApprovePayment(payment)}
                                    disabled={updatePaymentMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve Payment
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectPayment(payment)}
                                    disabled={updatePaymentMutation.isPending}
                                    variant="destructive"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject Payment
                                  </Button>
                                </div>
                              )}
                            </div>
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
