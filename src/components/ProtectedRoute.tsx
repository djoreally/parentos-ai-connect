
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLoadingSpinner from '@/components/AuthLoadingSpinner';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner during auth state transitions
  if (loading) {
    return <AuthLoadingSpinner />;
  }

  // Not authenticated - redirect to register
  if (!user) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // Authenticated but no role selected - only allow /select-role
  if (!profile?.role && location.pathname !== '/select-role') {
    return <Navigate to="/select-role" replace />;
  }

  // Has role but trying to access role selection - redirect to appropriate dashboard
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

  // Admin-only routes
  if (location.pathname.startsWith('/compliance') && profile?.role !== 'Admin') {
    const dashboardPath = profile?.role === 'Parent' ? '/dashboard' : '/team-dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
