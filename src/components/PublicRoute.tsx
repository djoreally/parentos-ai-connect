
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
  const { isAuthenticated, hasProfile, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return <FullPageLoader />;
  }

  // If user is authenticated and has a profile with role, redirect to dashboard
  if (isAuthenticated && hasProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated but no role selected, redirect to role selection
  if (isAuthenticated && !hasProfile) {
    return <Navigate to="/select-role" replace />;
  }

  // Show the public page (login/register)
  return children;
};

export default PublicRoute;
