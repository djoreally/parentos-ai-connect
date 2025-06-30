import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { ClerkAuthProvider } from "./contexts/ClerkAuthContext";
import LandingPage from "./pages/Landing";
import SignInPage from "./pages/auth/SignInPage";
import RegisterPage from "./pages/auth/RegisterPage";
import RoleSelectionPage from "./pages/auth/RoleSelectionPage";
import Dashboard from "./pages/Dashboard";
import ChildProfilePage from "./pages/ChildProfilePage";
import AssistantPage from "./pages/AssistantPage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "next-themes";
import TeamDashboardPage from "./pages/TeamDashboardPage";
import AddChildPage from "./pages/AddChildPage";
import ComplianceDashboardPage from "./pages/ComplianceDashboardPage";
import RoleManagementPage from "./pages/RoleManagementPage";
import LegalPage from "./pages/LegalPage";
import PrivacyPage from "./pages/PrivacyPage";
import SettingsPage from "./pages/SettingsPage";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingFallback from "./components/LoadingFallback";
import AppointmentsPage from "./pages/AppointmentsPage";
import NetworkErrorHandler from "./components/NetworkErrorHandler";
import { toast } from 'sonner';
import { initializeSecurity } from './utils/security';
import { useEffect, Suspense } from 'react';

// Create query client with enhanced error handling and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
          console.warn('Authentication error detected, not retrying:', error.message);
          return false;
        }
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          console.warn('Client error detected, not retrying:', error.status);
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      onError: (error: any) => {
        console.error('Query error:', error);
        // Only show user-friendly error messages
        if (!error?.message?.includes('JWT') && !error?.message?.includes('auth')) {
          toast.error('Failed to load data. Please try again.');
        }
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on authentication errors
        if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
          return false;
        }
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry once for network errors
        return failureCount < 1;
      },
      onError: (error: any) => {
        console.error('Mutation error:', error);
        // Only show generic error message to prevent information leakage
        if (!error?.message?.includes('JWT') && !error?.message?.includes('auth')) {
          toast.error('An error occurred. Please try again.');
        }
      },
    },
  },
});

const App = () => {
  useEffect(() => {
    try {
      // Initialize security measures on app start
      initializeSecurity();
      
      // Log successful app initialization
      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      toast.error('Failed to initialize application. Please refresh the page.');
    }
  }, []);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent the default browser behavior
      event.preventDefault();
      
      // Show user-friendly error message
      toast.error('An unexpected error occurred. Please try again.');
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      toast.error('An unexpected error occurred. Please refresh the page.');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <ClerkAuthProvider>
            <ErrorBoundary fallback={<LoadingFallback message="Authentication Error" />}>
              <TooltipProvider>
                <NetworkErrorHandler />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<LoadingFallback showSkeleton />}>
                    <Routes>
                      {/* Public pages - no auth required */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/legal" element={<LegalPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />

                      {/* Auth pages - only show when not signed in */}
                      <Route path="/login" element={
                        <ErrorBoundary>
                          <SignedOut>
                            <SignInPage />
                          </SignedOut>
                        </ErrorBoundary>
                      } />
                      <Route path="/register" element={
                        <ErrorBoundary>
                          <SignedOut>
                            <RegisterPage />
                          </SignedOut>
                        </ErrorBoundary>
                      } />
                      
                      {/* Protected pages - require authentication */}
                      <Route path="/select-role" element={
                        <ErrorBoundary>
                          <SignedIn>
                            <RoleSelectionPage />
                          </SignedIn>
                        </ErrorBoundary>
                      } />
                      <Route path="/dashboard" element={
                        <ErrorBoundary>
                          <SignedIn>
                            <Dashboard />
                          </SignedIn>
                        </ErrorBoundary>
                      } />
                      <Route path="/team-dashboard" element={
                        <ErrorBoundary>
                          <SignedIn>
                            <TeamDashboardPage />
                          </SignedIn>
                        </ErrorBoundary>
                      } />
                      <Route path="/child/:childId" element={
                        <ErrorBoundary>
                          <SignedIn>
                            <ChildProfilePage />
                          </SignedIn>
                        </ErrorBoundary>
                      } />
                      <Route path="/add-child" element={
                        <ErrorBoundary>
                          <SignedIn>
                            <AddChildPage />
                          </SignedIn>
                        </ErrorBoundary>
                      } />
                      <Route path="/assistant" element={
                        <ErrorBoundary>
                          <SignedIn>
                            <AssistantPage />
                          </SignedIn>
                        </ErrorBoundary>
                      } />
                      <Route path="/settings" element={
                        <ErrorBoundary>
                          <SignedIn>
                            <SettingsPage />
                          </SignedIn>
                        </ErrorBoundary>
                      } />
                      <Route path="/appointments" element={
                        <ErrorBoundary>
                          <SignedIn>
                            <AppointmentsPage />
                          </SignedIn>
                        </ErrorBoundary>
                      } />
                      
                      {/* Admin only pages */}
                      <Route path="/compliance" element={
                        <ErrorBoundary>
                          <SignedIn>
                            <ComplianceDashboardPage />
                          </SignedIn>
                        </ErrorBoundary>
                      } />
                      <Route path="/role-management" element={
                        <ErrorBoundary>
                          <SignedIn>
                            <RoleManagementPage />
                          </SignedIn>
                        </ErrorBoundary>
                      } />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </ErrorBoundary>
          </ClerkAuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;