import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { LoginForm } from "./components/auth/LoginForm";
import { AdminLayout } from "./components/layout/AdminLayout";
import { DashboardHome } from "./components/dashboard/DashboardHome";
import { ClientsList } from "./components/clients/ClientsList";
import { ClientDetail } from "./components/clients/ClientDetail";
import { SpaceDetail } from "./components/spaces/SpaceDetail";
import { PhotoManagement } from "./components/collections/PhotoManagement";
import { PublicGallery } from "./components/gallery/PublicGallery";

const queryClient = new QueryClient();

// Wrapper components that get params from URL
const ClientDetailWrapper = () => {
  const { clientId } = useParams<{ clientId: string }>();
  return <ClientDetail clientId={clientId!} />;
};

const SpaceDetailWrapper = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  return <SpaceDetail spaceId={spaceId!} />;
};

const PhotoManagementWrapper = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  return <PhotoManagement collectionId={collectionId!} />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

const AppContent = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/gallery/:shareId" element={<PublicGallery />} />
        <Route path="/login" element={<LoginForm />} />
        
        {/* Protected admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        } />
        <Route path="/admin/clients" element={
          <ProtectedRoute>
            <ClientsList />
          </ProtectedRoute>
        } />
        <Route path="/admin/clients/:clientId" element={
          <ProtectedRoute>
            <ClientDetailWrapper />
          </ProtectedRoute>
        } />
        <Route path="/admin/spaces/:spaceId" element={
          <ProtectedRoute>
            <SpaceDetailWrapper />
          </ProtectedRoute>
        } />
        <Route path="/admin/collections/:collectionId" element={
          <ProtectedRoute>
            <PhotoManagementWrapper />
          </ProtectedRoute>
        } />
        
        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
