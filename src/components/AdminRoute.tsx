
import { useAuth } from '@/contexts/ClerkAuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import AuthLoadingSpinner from '@/components/AuthLoadingSpinner';

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner during auth state transitions
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (profile?.role !== 'Admin') {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
