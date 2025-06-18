import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, Download, Trash2, FileText, FileImage, FileArchive, File } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  referenceId: string;
  referenceType: 'submission' | 'payment' | 'other';
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return <FileImage className="h-5 w-5 text-blue-500" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (mimeType.includes('zip') || mimeType.includes('compressed')) {
    return <FileArchive className="h-5 w-5 text-yellow-500" />;
  }
  return <File className="h-5 w-5 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function UploadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch uploaded files from Supabase Storage
  const { data: files = [], isLoading, refetch } = useQuery<UploadedFile[]>({
    queryKey: ['uploads', typeFilter],
    queryFn: async () => {
      try {
        // First get all files from the bucket
        const { data: files, error } = await supabase.storage
          .from('uploads')
          .list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
          });

        if (error) throw error;

        // Get public URLs and metadata for each file
        const filesWithData = await Promise.all(
          files.map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('uploads')
              .getPublicUrl(file.name);

            // Get file metadata if available
            const { data: metadata } = await supabase
              .from('file_metadata')
              .select('*')
              .eq('name', file.name)
              .single();

            return {
              id: file.id || Math.random().toString(36).substring(2, 9),
              name: file.name,
              type: file.metadata?.mimetype || 'application/octet-stream',
              size: file.metadata?.size || 0,
              url: publicUrl,
              uploadedBy: metadata?.uploaded_by || 'Unknown',
              uploadedAt: metadata?.created_at || new Date().toISOString(),
              referenceId: metadata?.reference_id || 'N/A',
              referenceType: (metadata?.reference_type as 'submission' | 'payment' | 'other') || 'other',
            };
          })
        );

        return filesWithData;
      } catch (err) {
        console.error('Error fetching uploads:', err);
        throw err;
      }
    },
  });

  const filteredFiles = files.filter(file => {
    const matchesSearch = 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || file.type.includes(typeFilter) || 
      (typeFilter === 'document' && 
        (file.type.includes('pdf') || 
         file.type.includes('doc') || 
         file.type.includes('text')));
    
    return matchesSearch && matchesType;
  });

  const handleDownload = (file: UploadedFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      toast({
        title: 'Download failed',
        description: 'Could not download the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deleteFile = useMutation({
    mutationFn: async (file: UploadedFile) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('uploads')
        .remove([file.name]);

      if (storageError) throw storageError;

      // Delete metadata if exists
      const { error: metadataError } = await supabase
        .from('file_metadata')
        .delete()
        .eq('name', file.name);

      // It's okay if metadata doesn't exist
      if (metadataError && metadataError.code !== 'PGRST116') {
        console.warn('Could not delete file metadata:', metadataError);
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: 'File deleted',
        description: 'The file has been successfully deleted.',
      });
      refetch();
    },
    onError: (error) => {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not delete the file. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (file: UploadedFile) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      deleteFile.mutate(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">File Uploads</h1>
        <p className="text-muted-foreground">
          Manage all uploaded files and generated documents
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="application/pdf">PDFs</option>
            <option value="archive">Archives</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all' 
                  ? 'No files match your filters.' 
                  : 'No files have been uploaded yet.'}
              </p>
              {(searchTerm || typeFilter !== 'all') && (
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
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
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <span className="truncate max-w-[200px] inline-block">
                            {file.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {file.type.split('/')[1] || file.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {file.referenceId}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {file.uploadedBy}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
