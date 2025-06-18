import { Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProtectedRoute } from '@/components/admin/protected-route';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminCoupons from '@/pages/admin/coupons';
import AdminSubmissions from '@/pages/admin/submissions';
import AdminPayments from '@/pages/admin/payments';
import AdminUsers from '@/pages/admin/users';
import AdminUploads from '@/pages/admin/uploads';
import AdminLogin from '@/pages/admin/login';

export const adminRoutes = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'coupons',
        element: <AdminCoupons />,
      },
      {
        path: 'submissions',
        element: <AdminSubmissions />,
      },
      {
        path: 'payments',
        element: <AdminPayments />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'uploads',
        element: <AdminUploads />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
];
