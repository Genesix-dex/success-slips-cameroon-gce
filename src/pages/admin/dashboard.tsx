import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FileText, CreditCard, Tag } from 'lucide-react';

const stats = [
  { name: 'Total Users', value: '2,345', icon: Users },
  { name: 'Total Submissions', value: '1,234', icon: FileText },
  { name: 'Total Revenue', value: '$12,345', icon: CreditCard },
  { name: 'Active Coupons', value: '12', icon: Tag },
];

export default function AdminDashboard() {
  // Example of fetching data with React Query
  const { data: recentSubmissions, isLoading } = useQuery({
    queryKey: ['recentSubmissions'],
    queryFn: async () => {
      // Replace with actual API call
      return [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSubmissions?.length ? (
              <div className="space-y-4">
                {recentSubmissions.map((submission: any) => (
                  <div key={submission.id} className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none">
                        {submission.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {submission.email}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent submissions
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No recent payments
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
