import React, { useState, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Upload, Trash2, Download, X } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface PhotoManagementProps {
  collectionId: string;
}

export const PhotoManagement: React.FC<PhotoManagementProps> = ({ collectionId }) => {
  const { getCollectionById, getSpaceById, getClientById, uploadPhoto, deletePhoto, setCurrentPage } = useApp();
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const collection = getCollectionById(collectionId);
  const space = collection ? getSpaceById(collection.spaceId) : null;
  const client = space ? getClientById(space.clientId) : null;

  if (!collection || !space || !client) {
    return (
      <div className="container-studio py-8">
        <Card className="card-elevated text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Collection not found</h3>
            <p className="text-muted-foreground mb-4">The requested collection could not be found</p>
            <Button onClick={() => setCurrentPage('clients')} variant="outline">
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          await uploadPhoto(collectionId, file);
        }
      }
      toast({
        title: "Photos Uploaded",
        description: `${files.length} photos uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload some photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    await deletePhoto(collectionId, photoId);
    toast({
      title: "Photo Deleted",
      description: "Photo has been removed from the collection.",
    });
  };

  const openLightbox = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  return (
    <div className="container-studio py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(`space-${space.id}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {space.name}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{collection.name}</h1>
          <p className="text-muted-foreground">Collection in {space.name} for {client.name}</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="card-elevated mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Photos
          </CardTitle>
          <CardDescription>
            Add new photos to the {collection.name} collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drag and drop photos here</h3>
            <p className="text-muted-foreground mb-4">or click to browse your files</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-hero gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Select Photos'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Photos ({collection.photos.length})</CardTitle>
          <CardDescription>
            Manage photos in this collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {collection.photos.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
              <p className="text-muted-foreground">Upload your first photos to get started</p>
            </div>
          ) : (
            <div className="photo-grid">
              {collection.photos.map((photo) => (
                <div key={photo.id} className="photo-grid-item group">
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                    onClick={() => openLightbox(photo.url)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="glass"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(photo.url);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content">
            <Button
              variant="glass"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={closeLightbox}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedPhoto}
              alt="Full size view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button variant="glass" className="gap-2">
                <Download className="h-4 w-4" />
                Download High Quality
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};