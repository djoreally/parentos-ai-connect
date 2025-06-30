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
import AppointmentsPage from "./pages/AppointmentsPage";
import NetworkErrorHandler from "./components/NetworkErrorHandler";
import { toast } from 'sonner';
import { initializeSecurity } from './utils/security';
import { useEffect } from 'react';

// Create query client with enhanced security and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
          return false;
        }
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
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
        toast.error('An error occurred. Please try again.');
      },
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize security measures on app start
    try {
      initializeSecurity();
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ClerkAuthProvider>
          <ErrorBoundary>
            <TooltipProvider>
              <NetworkErrorHandler />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public pages - no auth required */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />

                  {/* Auth pages - only show when not signed in */}
                  <Route path="/login" element={
                    <SignedOut>
                      <SignInPage />
                    </SignedOut>
                  } />
                  <Route path="/register" element={
                    <SignedOut>
                      <RegisterPage />
                    </SignedOut>
                  } />
                  
                  {/* Protected pages - require authentication */}
                  <Route path="/select-role" element={
                    <SignedIn>
                      <RoleSelectionPage />
                    </SignedIn>
                  } />
                  <Route path="/dashboard" element={
                    <SignedIn>
                      <Dashboard />
                    </SignedIn>
                  } />
                  <Route path="/team-dashboard" element={
                    <SignedIn>
                      <TeamDashboardPage />
                    </SignedIn>
                  } />
                  <Route path="/child/:childId" element={
                    <SignedIn>
                      <ChildProfilePage />
                    </SignedIn>
                  } />
                  <Route path="/add-child" element={
                    <SignedIn>
                      <AddChildPage />
                    </SignedIn>
                  } />
                  <Route path="/assistant" element={
                    <SignedIn>
                      <AssistantPage />
                    </SignedIn>
                  } />
                  <Route path="/settings" element={
                    <SignedIn>
                      <SettingsPage />
                    </SignedIn>
                  } />
                  <Route path="/appointments" element={
                    <SignedIn>
                      <AppointmentsPage />
                    </SignedIn>
                  } />
                  
                  {/* Admin only pages - will need additional role checking */}
                  <Route path="/compliance" element={
                    <SignedIn>
                      <ComplianceDashboardPage />
                    </SignedIn>
                  } />
                  <Route path="/role-management" element={
                    <SignedIn>
                      <RoleManagementPage />
                    </SignedIn>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ErrorBoundary>
        </ClerkAuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;