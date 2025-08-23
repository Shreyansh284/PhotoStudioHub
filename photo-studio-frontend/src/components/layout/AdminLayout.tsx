import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-background relative">
      {/* Sidebar for desktop only */}
      <div className="hidden md:block w-64 flex-shrink-0 h-full">
        <AdminSidebar />
      </div>
      {/* Sidebar overlay for mobile only */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden opacity-100 pointer-events-auto"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div
            className="fixed inset-y-0 left-0 w-64 bg-sidebar z-50 border-r border-sidebar-border transform transition-transform md:hidden translate-x-0"
          >
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with toggle button on mobile */}
        <div className="md:hidden flex items-center p-2 bg-background border-b border-sidebar-border">
          <button
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            {/* Hamburger icon */}
            <svg className="h-6 w-6 text-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-2 font-bold text-lg">Photo Studio</span>
        </div>
        <main className="flex-1 overflow-auto bg-secondary/20">
          {children}
        </main>
      </div>
    </div>
  );
};