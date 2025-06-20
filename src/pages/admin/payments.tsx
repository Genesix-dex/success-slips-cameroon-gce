
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2 } from 'lucide-react';
import { paymentApi } from '@/lib/api';

interface Payment {
  id: string;
  registration_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id: string | null;
  payer_name: string;
  phone_number: string;
  created_at: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');

  // Fetch payments
  const { data: payments = [], isLoading, error } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: paymentApi.getPayments,
  });

  // Update payment status mutation
  const updatePaymentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Payment['status'] }) => {
      return paymentApi.updatePayment(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Success',
        description: 'Payment status updated successfully',
      });
    },
    onError: (error) => {
      console.error('Update payment error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment status.',
        variant: 'destructive',
      });
    },
  });

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Manage payment transactions</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading payments: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Manage payment transactions and approvals
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
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
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === 'all' ? 'No payments found.' : `No ${filter} payments found.`}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payer Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.payer_name}
                      </TableCell>
                      <TableCell>
                        {payment.amount.toLocaleString()} XAF
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.payment_method}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {payment.transaction_id || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{payment.phone_number}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(payment.status)}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {payment.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-800"
                                onClick={() =>
                                  updatePaymentStatus.mutate({
                                    id: payment.id,
                                    status: 'completed',
                                  })
                                }
                                disabled={updatePaymentStatus.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-800"
                                onClick={() =>
                                  updatePaymentStatus.mutate({
                                    id: payment.id,
                                    status: 'failed',
                                  })
                                }
                                disabled={updatePaymentStatus.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {payment.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600"
                              onClick={() =>
                                updatePaymentStatus.mutate({
                                  id: payment.id,
                                  status: 'refunded',
                                })
                              }
                              disabled={updatePaymentStatus.isPending}
                            >
                              Refund
                            </Button>
                          )}
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
