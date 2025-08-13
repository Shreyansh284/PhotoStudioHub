import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { PublicGallery } from '../components/gallery/PublicGallery';
import { Camera, Shield, Eye, Users, Settings, ArrowRight } from 'lucide-react';
import heroImage from '../assets/hero-studio.jpg';

const Index = () => {
  const [view, setView] = useState<'landing' | 'admin' | 'gallery'>('landing');

  if (view === 'admin') {
    // This will trigger the main App component to show login/admin dashboard
    window.location.reload();
    return null;
  }

  if (view === 'gallery') {
    return <PublicGallery />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Professional Photography Studio" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero/80"></div>
        </div>
        
        <div className="relative container-studio py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-4">
                <Camera className="h-12 w-12" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Professional Photo Studio Management
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Streamline your photography business with our complete management platform. 
              Organize clients, manage galleries, and share stunning photo collections with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-glass gap-3 text-lg px-8 py-4"
                onClick={() => setView('admin')}
              >
                <Shield className="h-5 w-5" />
                Admin Dashboard
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 gap-3 text-lg px-8 py-4"
                onClick={() => setView('gallery')}
              >
                <Eye className="h-5 w-5" />
                View Demo Gallery
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container-studio">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to Manage Your Studio
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From client management to beautiful galleries, our platform provides all the tools 
              you need to run a successful photography business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-elevated text-center p-6">
              <CardHeader>
                <div className="bg-primary/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Organize client information, track sessions, and manage multiple photo spaces 
                  for each client with ease.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center p-6">
              <CardHeader>
                <div className="bg-accent/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl mb-2">Photo Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Organize photos into themed collections, upload in bulk, and manage 
                  your entire portfolio efficiently.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center p-6">
              <CardHeader>
                <div className="bg-success/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Eye className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="text-xl mb-2">Beautiful Galleries</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Share stunning, responsive galleries with clients via secure links. 
                  Perfect viewing experience on any device.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container-studio">
          <div className="bg-gradient-card rounded-2xl p-8 md:p-12 shadow-strong">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  See It In Action
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Explore our demo admin dashboard or check out a sample client gallery 
                  to see how powerful and intuitive our platform is.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Secure admin dashboard with full management capabilities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    <span>Easy-to-use interface for organizing photos and clients</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-primary" />
                    <span>Stunning public galleries with lightbox viewing</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="btn-hero w-full gap-3"
                    onClick={() => setView('admin')}
                  >
                    <Shield className="h-5 w-5" />
                    Try Admin Dashboard
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full gap-3"
                    onClick={() => setView('gallery')}
                  >
                    <Eye className="h-5 w-5" />
                    View Sample Gallery
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  No signup required for demo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary/5 py-8">
        <div className="container-studio text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Photo Studio Pro</span>
          </div>
          <p className="text-muted-foreground">
            Professional photography studio management made simple
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
