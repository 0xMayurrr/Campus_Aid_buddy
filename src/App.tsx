import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { TicketProvider } from '@/contexts/TicketContext';
import { ChatProvider } from '@/contexts/ChatContext';

// Pages
import Auth from './pages/Auth';
import ModernLanding from './pages/ModernLanding';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import SubmitRequest from './pages/SubmitRequest';
import DigitalLibrary from './pages/DigitalLibrary';
import CampusAI from './pages/CampusAI';
import GrowthDashboard from './pages/GrowthDashboard';
import Announcements from './pages/Announcements';
import StudentProfile from './pages/StudentProfile';
import Students from './pages/Students';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function WithLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ModernLanding />} />
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />} />

      {/* Protected — Dashboard (has own layout internally) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Protected — All feature pages share DashboardLayout */}
      <Route path="/tickets" element={
        <ProtectedRoute><WithLayout><Tickets /></WithLayout></ProtectedRoute>
      } />
      <Route path="/submit" element={
        <ProtectedRoute><WithLayout><SubmitRequest /></WithLayout></ProtectedRoute>
      } />
      <Route path="/library" element={
        <ProtectedRoute><WithLayout><DigitalLibrary /></WithLayout></ProtectedRoute>
      } />
      <Route path="/campus-ai" element={
        <ProtectedRoute><WithLayout><CampusAI /></WithLayout></ProtectedRoute>
      } />
      <Route path="/growth" element={
        <ProtectedRoute><WithLayout><GrowthDashboard /></WithLayout></ProtectedRoute>
      } />
      <Route path="/announcements" element={
        <ProtectedRoute><WithLayout><Announcements /></WithLayout></ProtectedRoute>
      } />
      <Route path="/student-profile" element={
        <ProtectedRoute><WithLayout><StudentProfile /></WithLayout></ProtectedRoute>
      } />
      <Route path="/students" element={
        <ProtectedRoute><Students /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><WithLayout><Settings /></WithLayout></ProtectedRoute>
      } />

      {/* Manage Users placeholder */}
      <Route path="/manage-users" element={
        <ProtectedRoute>
          <WithLayout>
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">User Management</p>
              <p className="text-slate-600 text-sm mt-2">Coming soon — seed data creates users automatically</p>
            </div>
          </WithLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TicketProvider>
          <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" richColors />
            <AppRoutes />
          </TooltipProvider>
          </ChatProvider>
        </TicketProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
