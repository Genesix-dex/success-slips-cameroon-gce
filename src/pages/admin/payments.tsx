import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, Filter, Check, X, Clock, AlertCircle, Download } from 'lucide-react';

interface Payment {
  id: string;
  reference: string;
  submissionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: string;
  transactionId: string;
  paidAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch payments from Supabase
  const { data: payments = [], isLoading, error } = useQuery<Payment[]>({
    queryKey: ['payments', statusFilter],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            user:user_id (id, email, full_name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(payment => ({
          id: payment.id,
          reference: payment.reference || `PAY-${payment.id.substring(0, 8)}`,
          submissionId: payment.submission_id,
          amount: payment.amount || 0,
          currency: payment.currency || 'XAF',
          status: payment.status || 'pending',
          method: payment.payment_method || 'unknown',
          transactionId: payment.transaction_id || 'N/A',
          paidAt: payment.paid_at,
          createdAt: payment.created_at || new Date().toISOString(),
          user: {
            id: payment.user?.id || 'unknown',
            email: payment.user?.email || 'N/A',
            fullName: payment.user?.full_name || 'Unknown User',
          },
        }));
      } catch (err) {
        console.error('Error fetching payments:', err);
        throw err;
      }
    },
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      // Format data for CSV
      const headers = [
        'Reference', 'User', 'Email', 'Amount', 'Currency', 
        'Status', 'Method', 'Transaction ID', 'Paid At', 'Created At'
      ];
      
      const csvContent = [
        headers.join(','),
        ...payments.map(payment => [
          `"${payment.reference}"`,
          `"${payment.user.fullName}"`,
          `"${payment.user.email}"`,
          payment.amount,
          payment.currency,
          payment.status,
          payment.method,
          `"${payment.transactionId}"`,
          payment.paidAt || 'N/A',
          payment.createdAt
        ].join(','))
      ].join('\n');
      
      // Create and trigger download
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            View and manage payment transactions
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
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
                    <TableHead>Reference</TableHead>
                    <TableHead>User</TableHead>
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
                          <span>{payment.user.fullName}</span>
                          <span className="text-xs text-muted-foreground">
                            {payment.user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount, payment.currency)}
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
                        {payment.paidAt 
                          ? format(new Date(payment.paidAt), 'MMM d, yyyy HH:mm')
                          : format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Implement view details
                            console.log('View payment:', payment.id);
                          }}
                        >
                          View
                        </Button>
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
