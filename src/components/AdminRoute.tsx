
import { useAuth } from '@/contexts/ClerkAuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import AuthLoadingSpinner from '@/components/AuthLoadingSpinner';

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner during auth state transitions
  if (loading) {
    return <AuthLoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile?.role !== 'Admin') {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
