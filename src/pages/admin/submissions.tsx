import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, Download, Eye, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Submission {
  id: string;
  reference_number?: string;
  full_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  amount_paid?: number;
  created_at: string;
  exam_level?: string;
  department?: string;
  documents?: DocumentType[];
  phone?: string;
}

interface Document {
  id: string;
  type: string;
  url: string;
  name?: string;
}

type DocumentType = string | Document;

export default function SubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch registrations
  const { data: registrations = [], isLoading, error } = useQuery<Submission[]>({
    queryKey: ['registrations', statusFilter],
    queryFn: async (): Promise<Submission[]> => {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching registrations:', error);
          throw error;
        }
        
        console.log('Fetched registrations:', data);
        
        // Map the database fields to your Submission type
        return (data || []).map(reg => ({
          id: reg.id,
          reference_number: reg.reference_number || `REG-${reg.id.substring(0, 8)}`,
          full_name: reg.full_name || 'N/A',
          email: reg.email || 'N/A',
          status: reg.status || 'pending',
          amount_paid: reg.amount_paid || 0,
          created_at: reg.created_at || new Date().toISOString(),
          exam_level: reg.exam_level,
          department: reg.department,
          documents: reg.documents || [],
          phone: reg.phone
        }));
      } catch (err) {
        console.error('Error in queryFn:', err);
        throw err;
      }
    },
  });

  // Filter registrations based on search and status
  const filteredSubmissions = registrations.filter(registration => {
    const searchLower = searchTerm.toLowerCase();
    const reference = registration.reference_number || `REG-${registration.id.substring(0, 8)}`;
    const matchesSearch = 
      reference.toLowerCase().includes(searchLower) ||
      (registration.full_name || '').toLowerCase().includes(searchLower) ||
      (registration.email || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pending', variant: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'Processing', variant: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', variant: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', variant: 'bg-red-100 text-red-800' },
    } as const;

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const handleDownloadAll = (submission: Submission) => {
    if (!submission.documents?.length) return;
    
    submission.documents.forEach(doc => {
      const docUrl = typeof doc === 'string' ? doc : doc.url;
      if (docUrl) {
        window.open(docUrl, '_blank');
      }
    });
  };

  const { refetch } = useQuery({ queryKey: ['submissions'] });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading submissions. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-2 px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Submissions</h1>
          <p className="text-muted-foreground">
            View and manage all form submissions
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search submissions..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No submissions match your filters.' 
                  : 'No submissions found.'}
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Exam Level</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        <div className="font-medium">#{submission.reference_number || `REG-${submission.id.substring(0, 8)}`}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{submission.full_name}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {submission.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {submission.exam_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {submission.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(submission.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              // Implement view details
                              console.log('View submission:', submission.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download all documents"
                            onClick={() => handleDownloadAll(submission)}
                            disabled={!submission.documents?.length}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {submission.documents?.map((doc, index) => {
                            if (!doc) return null;
                            
                            const docUrl = typeof doc === 'string' ? doc : doc.url;
                            if (!docUrl) return null;
                            
                            const docName = typeof doc === 'string' 
                              ? `Document ${index + 1}` 
                              : doc.name || `Document ${index + 1}`;
                            
                            return (
                              <a
                                key={index}
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-blue-600 hover:underline ml-2"
                                title={`Download ${docName}`}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                {docName}
                              </a>
                            );
                          })}
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
