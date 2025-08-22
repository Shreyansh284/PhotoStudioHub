import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Plus, Camera, Calendar, Settings, Copy } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface ClientDetailProps {
  clientId?: string;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ clientId: propClientId }) => {
  const { clientId: paramClientId } = useParams<{ clientId: string }>();
  const clientId = propClientId || paramClientId!;
  const { getClientById, getSpacesByClientId, addPhotoSpace } = useApp();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');

  const client = getClientById(clientId);
  const spaces = getSpacesByClientId(clientId);

  if (!client) {
    return (
      <div className="container-studio py-8">
        <Card className="card-elevated text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Client not found</h3>
            <p className="text-muted-foreground mb-4">The requested client could not be found</p>
            <Button onClick={() => navigate('/admin/clients')} variant="outline">
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSpaceName) {
      await addPhotoSpace({ name: newSpaceName, clientId });
      setNewSpaceName('');
      setIsDialogOpen(false);
      toast({ title: "Photo Space Created", description: `${newSpaceName} has been created successfully.` });
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Gallery link has been copied to clipboard.",
    });
  };

  const handleManageSpace = (spaceId: string) => {
    navigate(`/admin/spaces/${spaceId}`);
  };

  return (
    <div className="container-studio py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/clients')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
          <p className="text-muted-foreground">{client.email}</p>
        </div>
      </div>

      {/* Client Info */}
      <Card className="card-elevated mb-6">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Name</Label>
              <p className="text-foreground font-medium">{client.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-foreground font-medium">{client.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Client Since</Label>
              <p className="text-foreground font-medium">
                {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Spaces */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Photo Spaces</h2>
          <p className="text-muted-foreground">Manage galleries and collections for this client</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-hero gap-2">
              <Plus className="h-4 w-4" />
              Create New Space
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Photo Space</DialogTitle>
              <DialogDescription>
                Create a new photo gallery space for {client.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSpace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spaceName">Space Name</Label>
                <Input
                  id="spaceName"
                  placeholder="e.g., Wedding Photography Session"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-hero">
                  Create Space
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {spaces.length === 0 ? (
        <Card className="card-elevated text-center py-12">
          <CardContent>
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No photo spaces yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a photo space to start organizing galleries for {client.name}
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="btn-hero gap-2">
              <Plus className="h-4 w-4" />
              Create First Space
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {spaces.map((space) => (
            <Card key={space.id} className="card-elevated hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/10 rounded-full p-2">
                      <Camera className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{space.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Created {new Date(space.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Shareable Link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={`${window.location.origin}/gallery/${space.shareableLink}`}
                        readOnly
                        className="text-sm bg-muted/50"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyLink(`${window.location.origin}/gallery/${space.shareableLink}`)}
                        className="gap-1"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleManageSpace(space.id)}
                    className="w-full gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Manage Collections
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};