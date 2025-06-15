
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLoadingSpinner from '@/components/AuthLoadingSpinner';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, profile, loading } = useAuth();

  // Show loading spinner during auth state transitions
  if (loading) {
    return <AuthLoadingSpinner />;
  }

  // If user is logged in and has completed role selection, redirect to dashboard
  if (user && profile?.role) {
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

  // If user is logged in but hasn't selected role, redirect to role selection
  if (user && !profile?.role) {
    return <Navigate to="/select-role" replace />;
  }

  // User is not logged in, show the public page
  return children;
};

export default PublicRoute;
