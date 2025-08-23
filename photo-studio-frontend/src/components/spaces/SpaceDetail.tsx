import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Plus, Image, Calendar, Copy, Settings } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface SpaceDetailProps {
  spaceId: string;
}

export const SpaceDetail: React.FC<SpaceDetailProps> = ({ spaceId }) => {
  const { getSpaceById, getClientById, getCollectionsBySpaceId, addCollection, setCurrentPage } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const space = getSpaceById(spaceId);
  const client = space ? getClientById(space.clientId) : null;
  const collections = getCollectionsBySpaceId(spaceId);

  if (!space || !client) {
    return (
      <div className="container-studio py-8">
        <Card className="card-elevated text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Space not found</h3>
            <p className="text-muted-foreground mb-4">The requested photo space could not be found</p>
            <Button onClick={() => setCurrentPage('clients')} variant="outline">
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName) {
      await addCollection({ name: newCollectionName, spaceId });
      setNewCollectionName('');
      setIsDialogOpen(false);
      toast({ title: "Collection Created", description: `${newCollectionName} collection has been created successfully.` });
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/gallery/${space.shareableLink}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Gallery link has been copied to clipboard.",
    });
  };

  const handleManageCollection = (collectionId: string) => {
    setCurrentPage(`collection-${collectionId}`);
  };

  return (
    <div className="container-studio py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(`client-${client.id}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {client.name}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{space.name}</h1>
          <p className="text-muted-foreground">Photo space for {client.name}</p>
        </div>
      </div>

      {/* Space Info */}
      <Card className="card-elevated mb-6">
        <CardHeader>
          <CardTitle>Space Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Space Name</Label>
              <p className="text-foreground font-medium mb-3">{space.name}</p>

              <Label className="text-sm font-medium text-muted-foreground">Client</Label>
              <p className="text-foreground font-medium mb-3">{client.name}</p>

              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="text-foreground font-medium">
                {new Date(space.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Public Gallery Link</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={`${window.location.origin}/gallery/${space.shareableLink}`}
                  readOnly
                  className="text-sm bg-muted/50"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this link with your client to view their gallery
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Photo Collections</h2>
          <p className="text-muted-foreground">Organize photos into themed collections</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-hero gap-2">
              <Plus className="h-4 w-4" />
              Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Photo Collection</DialogTitle>
              <DialogDescription>
                Add a new collection to organize photos in {space.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCollection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collectionName">Collection Name</Label>
                <Input
                  id="collectionName"
                  placeholder="e.g., Ceremony, Reception, Portraits"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-hero">
                  Create Collection
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <Card className="card-elevated text-center py-12">
          <CardContent>
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
            <p className="text-muted-foreground mb-4">
              Create collections to organize photos by theme, event, or style
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="btn-hero gap-2">
              <Plus className="h-4 w-4" />
              Create First Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="card-elevated hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/10 rounded-full p-2">
                      <Image className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                      <CardDescription>
                        {collection.photos.length} photos
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleManageCollection(collection.id)}
                  className="w-full gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Photos
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};