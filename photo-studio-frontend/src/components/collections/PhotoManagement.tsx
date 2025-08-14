import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { ArrowLeft, Upload, Trash2, Download, X } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import BulkUpload from '../admin/BulkUpload';

interface PhotoManagementProps {
  collectionId: string;
}

export const PhotoManagement: React.FC<PhotoManagementProps> = ({ collectionId }) => {
  const { getCollectionById, getSpaceById, getClientById, uploadPhoto, deletePhoto, deleteAllPhotos, setCurrentPage } = useApp();
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
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

  // Lazy-chunk photos to reduce initial render work
  const chunkSize = 60; // render in chunks to avoid UI jank
  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const photos = collection.photos;
  const visiblePhotos = useMemo(() => photos.slice(0, visibleCount), [photos, visibleCount]);

  const loadMore = () => setVisibleCount(c => Math.min(c + chunkSize, photos.length));

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

      {/* Bulk Upload Section */}
      <Card className="card-elevated mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Bulk Upload Photos
          </CardTitle>
          <CardDescription>
            Add multiple photos or a whole folder to the {collection.name} collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BulkUpload
            collectionId={collection.id}
            onCompleted={() => {
              toast({ title: 'Upload complete', description: 'Photos have been uploaded.' });
            }}
          />
        </CardContent>
      </Card>

      {/* Photo Grid */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Photos ({collection.photos.length})</CardTitle>
            {collection.photos.length > 0 && (
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeletingAll}
                  >
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete all photos?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all photos in “{collection.name}”. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeletingAll}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        try {
                          setIsDeletingAll(true);
                          await deleteAllPhotos(collection.id);
                          toast({ title: 'All photos deleted', description: 'The collection is now empty.' });
                          setConfirmOpen(false);
                        } finally {
                          setIsDeletingAll(false);
                        }
                      }}
                    >
                      {isDeletingAll ? 'Deleting…' : 'Delete All'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
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
            <>
              {/* Masonry-like columns for admin view to keep it fast */}
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                {visiblePhotos.map((photo) => (
                  <div key={photo.id} className="photo-grid-item group">
                    <img src={photo.url} alt={photo.filename}
                      className="w-full h-auto object-cover rounded-lg mb-4 break-inside-avoid"
                      loading="lazy" decoding="async"
                      onClick={() => openLightbox(photo.url)} />
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
              {/* Load more button for large lists */}
              {visibleCount < photos.length && (
                <div className="flex justify-center mt-6">
                  <Button variant="outline" onClick={loadMore}>
                    Load more ({photos.length - visibleCount} left)
                  </Button>
                </div>
              )}
            </>
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