
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
  const { user, profile, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return <FullPageLoader />;
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (user && profile) {
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

  // If user exists but no profile/role, send to role selection
  if (user && !profile?.role) {
    return <Navigate to="/select-role" replace />;
  }

  // Show the public page (login/register)
  return children;
};

export default PublicRoute;
