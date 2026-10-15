import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '../ui/skeleton';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-navy-100 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <Skeleton className="h-4 w-48 mx-auto" />
          <p className="text-sm text-gray-500">Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to user's correct dashboard
    const dashboardPaths: Record<string, string> = {
      STUDENT: '/student/dashboard',
      TEACHER: '/school/dashboard',
      PRINCIPAL: '/school/dashboard',
      DISTRICT_OFFICER: '/district/dashboard',
      STATE_ADMIN: '/admin/dashboard',
    };
    return <Navigate to={dashboardPaths[user.role] || '/'} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export { ProtectedRoute };
