
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing";
import SignInPage from "./pages/auth/SignInPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import RoleSelectionPage from "./pages/auth/RoleSelectionPage";
import Dashboard from "./pages/Dashboard";
import ChildProfilePage from "./pages/ChildProfilePage";
import AssistantPage from "./pages/AssistantPage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "next-themes";
import TeamDashboardPage from "./pages/TeamDashboardPage";
import AddChildPage from "./pages/AddChildPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";
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
    initializeSecurity();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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

                  {/* Auth pages - redirect if already authenticated */}
                  <Route path="/login" element={<PublicRoute><SignInPage /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                  <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  
                  {/* Protected pages - require authentication */}
                  <Route path="/select-role" element={<ProtectedRoute><RoleSelectionPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/team-dashboard" element={<ProtectedRoute><TeamDashboardPage /></ProtectedRoute>} />
                  <Route path="/child/:childId" element={<ProtectedRoute><ChildProfilePage /></ProtectedRoute>} />
                  <Route path="/add-child" element={<ProtectedRoute><AddChildPage /></ProtectedRoute>} />
                  <Route path="/assistant" element={<ProtectedRoute><AssistantPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
                  
                  {/* Admin only pages */}
                  <Route path="/compliance" element={<AdminRoute><ComplianceDashboardPage /></AdminRoute>} />
                  <Route path="/role-management" element={<AdminRoute><RoleManagementPage /></AdminRoute>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
