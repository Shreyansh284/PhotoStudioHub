import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Camera, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../../api';

type Photo = { id: string; url: string; title?: string };
type Collection = { id: string; name: string; photos: Photo[] };

function useShareableLink(): string | null {
  // Basic extraction from URL: support /gallery/<link> or ?link=<link>
  const path = window.location.pathname;
  const byPath = path.startsWith('/gallery/') ? decodeURIComponent(path.split('/gallery/')[1] || '') : '';
  const byQuery = new URLSearchParams(window.location.search).get('link') || '';
  return byPath || byQuery || null;
}

export const PublicGallery: React.FC = () => {
  const link = useShareableLink();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spaceName, setSpaceName] = useState('');
  const [studioName, setStudioName] = useState('Your Studio');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!link) {
        setError('Missing gallery link');
        setLoading(false);
        return;
      }
      try {
        const space = await api.getPublicSpaceByLink(link);
        setSpaceName(space.name);
        setStudioName(space.client?.name || 'Your Studio');
        const mapped: Collection[] = (space.collections || []).map((c) => ({
          id: c._id,
          name: c.name,
          photos: (c.photos || []).map((p) => ({ id: p.public_id, url: p.url })),
        }));
        setCollections(mapped);
        setActiveCollection(mapped[0] || { id: 'empty', name: 'Photos', photos: [] });
      } catch (e: any) {
        setError(e?.message || 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [link]);

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
    const photoIndex = activeCollection.photos.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(photoIndex);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;

    const newIndex = direction === 'next'
      ? (currentPhotoIndex + 1) % activeCollection.photos.length
      : (currentPhotoIndex - 1 + activeCollection.photos.length) % activeCollection.photos.length;

    setCurrentPhotoIndex(newIndex);
    setSelectedPhoto(activeCollection.photos[newIndex]);
  };

  const handleDownload = (photo: Photo) => {
    // In a real app, this would download the high-res version
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `${photo.title}.jpg`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading gallery…</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>
    );
  }

  if (!activeCollection) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground py-8">
        <div className="container-studio">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/10 rounded-full p-2">
              <Camera className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">{studioName}</h1>
          </div>
          <h2 className="text-3xl font-bold mb-2">{spaceName}</h2>
          <p className="text-primary-foreground/80">
            Your beautiful moments captured with love and care
          </p>
        </div>
      </header>

      <div className="container-studio py-8">
        {/* Collection Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {collections.map((collection) => (
            <Button
              key={collection.id}
              variant={activeCollection?.id === collection.id ? "default" : "outline"}
              onClick={() => setActiveCollection(collection)}
              className="gap-2"
            >
              {collection.name}
              <span className="bg-background/20 text-xs px-2 py-1 rounded-full">
                {collection.photos.length}
              </span>
            </Button>
          ))}
        </div>

        {/* Photo Grid */}
        {activeCollection.photos.length === 0 ? (
          <Card className="card-elevated text-center py-12">
            <CardContent>
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Photos Coming Soon</h3>
              <p className="text-muted-foreground">
                Your photos are being prepared. Please check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="photo-grid">
            {activeCollection.photos.map((photo) => (
              <div
                key={photo.id}
                className="photo-grid-item group"
                onClick={() => openLightbox(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.title || 'Photo'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button variant="glass" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content">
            {/* Close Button */}
            <Button
              variant="glass"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={closeLightbox}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation Arrows */}
            {activeCollection.photos.length > 1 && (
              <>
                <Button
                  variant="glass"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhoto('prev');
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="glass"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhoto('next');
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title || 'Photo'}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <Button
                variant="glass"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(selectedPhoto);
                }}
              >
                <Download className="h-4 w-4" />
                Download High Quality
              </Button>
            </div>

            {/* Photo Counter */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentPhotoIndex + 1} of {activeCollection.photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};