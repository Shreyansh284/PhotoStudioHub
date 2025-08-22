import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Camera, FolderOpen, Plus } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { clients, photoSpaces, collections } = useApp();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Clients',
      value: clients.length,
      description: 'Active clients in the system',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Photo Spaces',
      value: photoSpaces.length,
      description: 'Created photo galleries',
      icon: Camera,
      color: 'text-accent'
    },
    {
      title: 'Total Collections',
      value: collections.length,
      description: 'Organized photo collections',
      icon: FolderOpen,
      color: 'text-success'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Client',
      description: 'Create a new client profile',
      icon: Plus,
      action: () => navigate('/admin/clients'),
      variant: 'default' as const
    },
    {
      title: 'View All Clients',
      description: 'Manage existing clients',
      icon: Users,
      action: () => navigate('/admin/clients'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your photo studio management dashboard
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={action.variant}
                    onClick={action.action}
                    className="w-full"
                  >
                    {action.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/clients/${client.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))}
              {clients.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No clients yet. Add your first client to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};