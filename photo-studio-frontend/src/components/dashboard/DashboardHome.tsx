import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Camera, Plus, Image } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { clients, photoSpaces, collections, setCurrentPage } = useApp();

  const stats = [
    {
      title: 'Total Clients',
      value: clients.length,
      description: 'Active clients in your studio',
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
      icon: Image,
      color: 'text-success'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Client',
      description: 'Create a new client profile',
      icon: Plus,
      action: () => setCurrentPage('clients'),
      variant: 'default' as const
    },
    {
      title: 'Create Photo Space',
      description: 'Set up a new gallery space',
      icon: Camera,
      action: () => setCurrentPage('clients'),
      variant: 'secondary' as const
    }
  ];

  return (
    <div className="container-studio py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Your Studio Dashboard</h1>
        <p className="text-muted-foreground">Manage your clients, photo spaces, and collections from here.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-elevated hover:shadow-medium transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks to get you started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg hover:bg-accent-soft/30 transition-colors cursor-pointer group"
                  onClick={action.action}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-lg p-2 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="card-elevated mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your photo studio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-accent-soft/20 rounded-lg">
              <div className="bg-success/10 rounded-full p-2">
                <Users className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New client added: Emma Wilson</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-accent-soft/20 rounded-lg">
              <div className="bg-primary/10 rounded-full p-2">
                <Camera className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Photo space created: Wedding Photography Session</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};