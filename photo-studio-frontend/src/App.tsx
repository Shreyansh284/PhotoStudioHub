import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { LoginForm } from "./components/auth/LoginForm";
import { AdminLayout } from "./components/layout/AdminLayout";
import { DashboardHome } from "./components/dashboard/DashboardHome";
import { ClientsList } from "./components/clients/ClientsList";
import { ClientDetail } from "./components/clients/ClientDetail";
import { SpaceDetail } from "./components/spaces/SpaceDetail";
import { PhotoManagement } from "./components/collections/PhotoManagement";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const { currentPage } = useApp();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderPage = () => {
    if (currentPage === 'dashboard') {
      return <DashboardHome />;
    }
    if (currentPage === 'clients') {
      return <ClientsList />;
    }
    if (currentPage.startsWith('client-')) {
      const clientId = currentPage.split('-')[1];
      return <ClientDetail clientId={clientId} />;
    }
    if (currentPage.startsWith('space-')) {
      const spaceId = currentPage.split('-')[1];
      return <SpaceDetail spaceId={spaceId} />;
    }
    if (currentPage.startsWith('collection-')) {
      const collectionId = currentPage.split('-')[1];
      return <PhotoManagement collectionId={collectionId} />;
    }
    return <DashboardHome />;
  };

  return (
    <AdminLayout>
      {renderPage()}
    </AdminLayout>
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
