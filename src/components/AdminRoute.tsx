
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
          <div className="flex-grow container mx-auto px-4 md:px-8 py-12 flex items-center justify-center">
            <div className="w-full max-w-4xl space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
          </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile?.role !== 'Admin') {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
