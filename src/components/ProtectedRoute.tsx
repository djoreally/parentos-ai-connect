
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

  // Show loading while checking auth state
  if (loading) {
    return <FullPageLoader />;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but no role selected, redirect to role selection
  if (!profile?.role && location.pathname !== '/select-role') {
    return <Navigate to="/select-role" replace />;
  }

  // If has role but on role selection page, redirect to appropriate dashboard
  if (profile?.role && location.pathname === '/select-role') {
    if (profile.role === 'Admin') {
      return <Navigate to="/compliance" replace />;
    }
    if (profile.role === 'Parent') {
      return <Navigate to="/dashboard" replace />;
    }
    if (profile.role === 'Teacher' || profile.role === 'Doctor') {
      return <Navigate to="/team-dashboard" replace />;
    }
  }

  // Restrict compliance access to admins only
  if (location.pathname.startsWith('/compliance') && profile?.role !== 'Admin') {
    const dashboardPath = profile?.role === 'Parent' ? '/dashboard' : '/team-dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // All checks passed, render the protected component
  return children;
};

export default ProtectedRoute;
