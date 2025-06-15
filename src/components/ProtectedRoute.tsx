
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const FullPageLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
       <Skeleton className="h-12 w-12 rounded-full" />
       <div className="space-y-2">
         <Skeleton className="h-4 w-[250px]" />
         <Skeleton className="h-4 w-[200px]" />
       </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile?.role && location.pathname !== '/select-role') {
    return <Navigate to="/select-role" replace />;
  }

  if (profile?.role && location.pathname === '/select-role') {
    if (profile.role === 'Admin') {
      return <Navigate to="/compliance" replace />;
    }
    return <Navigate to={profile.role === 'Parent' ? '/dashboard' : '/team-dashboard'} replace />;
  }

  // Restrict access to compliance dashboard for non-admins
  if (location.pathname.startsWith('/compliance') && profile?.role !== 'Admin') {
    const dashboardPath = profile?.role === 'Parent' ? '/dashboard' : '/team-dashboard';
    return <Navigate to={profile?.role ? dashboardPath : '/select-role'} replace />;
  }

  return children;
};

export default ProtectedRoute;
