
import React from 'react';
import { Navigate } from 'react-router-dom';
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

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (user) {
    if (profile?.role) {
      const dashboardPath = profile.role === 'Parent' ? '/dashboard' : '/team-dashboard';
      return <Navigate to={dashboardPath} replace />;
    }
    return <Navigate to="/select-role" replace />;
  }

  return children;
};

export default PublicRoute;
