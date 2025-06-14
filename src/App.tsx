
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";
import ComplianceDashboardPage from "./pages/ComplianceDashboardPage";
import LegalPage from "./pages/LegalPage";
import PrivacyPage from "./pages/PrivacyPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              <Route path="/login" element={<PublicRoute><SignInPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              
              <Route path="/select-role" element={<ProtectedRoute><RoleSelectionPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/team-dashboard" element={<ProtectedRoute><TeamDashboardPage /></ProtectedRoute>} />
              <Route path="/child/:childId" element={<ProtectedRoute><ChildProfilePage /></ProtectedRoute>} />
              <Route path="/add-child" element={<ProtectedRoute><AddChildPage /></ProtectedRoute>} />
              <Route path="/assistant" element={<ProtectedRoute><AssistantPage /></ProtectedRoute>} />
              <Route path="/compliance" element={<AdminRoute><ComplianceDashboardPage /></AdminRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
