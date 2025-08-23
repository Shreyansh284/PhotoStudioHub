import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Camera,
  User
} from 'lucide-react';

interface AdminSidebarProps {
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      isActive: location.pathname === '/admin'
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      path: '/admin/clients',
      isActive: location.pathname.startsWith('/admin/clients')
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border relative">
      {/* Logo and Title + Close button for mobile */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary rounded-lg p-2">
            <Camera className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Photo Studio</h1>
            <p className="text-sidebar-foreground/70 text-sm">Management Dashboard</p>
          </div>
        </div>
        {/* Close button only on mobile */}
        {onClose && (
          <button
            className="md:hidden p-2 ml-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <svg className="h-6 w-6 text-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={item.isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  item.isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* User Info and Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4 p-3 bg-sidebar-accent rounded-lg">
          <div className="bg-sidebar-primary rounded-full p-2">
            <User className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-sidebar-accent-foreground">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};