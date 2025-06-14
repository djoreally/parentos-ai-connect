
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
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile?.role && location.pathname !== '/select-role') {
    return <Navigate to="/select-role" replace />;
  }

  if (profile?.role && location.pathname === '/select-role') {
    return <Navigate to={profile.role === 'Parent' ? '/dashboard' : '/team-dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
