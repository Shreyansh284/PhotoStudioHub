import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Camera, X, Download, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import * as api from '../../api';
import { FaceGallery } from './FaceGallery';

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
  const [spaceId, setSpaceId] = useState('');
  const [studioName, setStudioName] = useState('Your Studio');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Face gallery state
  const [viewMode, setViewMode] = useState<'collections' | 'faces'>('collections');
  const [selectedFace, setSelectedFace] = useState<api.DetectedFace | null>(null);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);

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
        setSpaceId(space._id);
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

  // Update filtered photos when face selection changes
  useEffect(() => {
    if (!selectedFace || !collections.length) {
      setFilteredPhotos([]);
      return;
    }

    // Find all photos that contain the selected face
    const allPhotos = collections.flatMap(c => c.photos);

    // Use photoPublicIds if available, otherwise fall back to photoIds for backwards compatibility
    const targetIds = selectedFace.photoPublicIds && selectedFace.photoPublicIds.length > 0
      ? selectedFace.photoPublicIds
      : selectedFace.photoIds;

    const facePhotos = allPhotos.filter(photo =>
      targetIds?.includes(photo.id)
    );

    console.log('Filtering photos:', {
      selectedFaceId: selectedFace.id,
      photoPublicIds: selectedFace.photoPublicIds,
      photoIds: selectedFace.photoIds,
      targetIds,
      allPhotosCount: allPhotos.length,
      filteredCount: facePhotos.length,
      samplePhotoIds: allPhotos.slice(0, 3).map(p => p.id)
    });
    setFilteredPhotos(facePhotos);
  }, [selectedFace, collections]);

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);

    // Determine which photo list to use for navigation
    const photoList = viewMode === 'faces' && selectedFace
      ? filteredPhotos
      : activeCollection?.photos || [];

    const photoIndex = photoList.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(photoIndex);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;

    // Determine which photo list to use for navigation
    const photoList = viewMode === 'faces' && selectedFace
      ? filteredPhotos
      : activeCollection?.photos || [];

    if (photoList.length === 0) return;

    const newIndex =
      direction === 'next'
        ? (currentPhotoIndex + 1) % photoList.length
        : (currentPhotoIndex - 1 + photoList.length) % photoList.length;

    setCurrentPhotoIndex(newIndex);
    setSelectedPhoto(photoList[newIndex]);
  };

  const handleFaceSelect = (face: api.DetectedFace | null) => {
    setSelectedFace(face);
    if (!face) {
      // Return to collections view
      setViewMode('collections');
    }
  };

  const handleViewModeChange = (mode: 'collections' | 'faces') => {
    setViewMode(mode);
    setSelectedFace(null);
    setFilteredPhotos([]);
  };

  // Prefetch and cache images for faster viewing (Unsplash-like snappiness)
  useEffect(() => {
    const photosToCache = viewMode === 'faces' && selectedFace
      ? filteredPhotos
      : activeCollection?.photos || [];

    if (!photosToCache?.length) return;

    const urls = photosToCache.map(p => p.url).slice(0, 50); // limit to first 50
    let cancelled = false;

    const run = async () => {
      try {
        if (typeof window === 'undefined' || !('caches' in window)) return;
        const cache = await (window as any).caches.open('photohub-images-v1');
        for (const url of urls) {
          if (cancelled) return;
          const match = await cache.match(url);
          if (!match) {
            // Fetch with same-origin credentials as default; let the browser cache it.
            await cache.add(url);
          }
        }
      } catch {
        // ignore caching errors
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [activeCollection?.id, viewMode, selectedFace, filteredPhotos]);

  const handleDownload = (photo: Photo) => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `${photo.title || 'photo'}.jpg`;
    a.click();
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

  // Determine which photos to display
  const photosToDisplay = viewMode === 'faces' && selectedFace
    ? filteredPhotos
    : activeCollection?.photos || [];

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
        {/* Main Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={viewMode === 'collections' ? "default" : "outline"}
            onClick={() => handleViewModeChange('collections')}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            Collections
          </Button>
          <Button
            variant={viewMode === 'faces' ? "default" : "outline"}
            onClick={() => handleViewModeChange('faces')}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Faces
          </Button>
        </div>

        {viewMode === 'faces' ? (
          /* Face Gallery View */
          <FaceGallery
            spaceId={spaceId}
            onFaceSelect={handleFaceSelect}
            selectedFace={selectedFace}
          />
        ) : (
          /* Collections View */
          <>
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
          </>
        )}

        {/* Photo Grid - Show for both collections and filtered face photos */}
        {(viewMode === 'collections' || (viewMode === 'faces' && selectedFace)) && (
          <>
            {photosToDisplay.length === 0 ? (
              <Card className="card-elevated text-center py-12">
                <CardContent>
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {viewMode === 'faces' ? 'No Photos Found' : 'Photos Coming Soon'}
                  </h3>
                  <p className="text-muted-foreground">
                    {viewMode === 'faces'
                      ? 'No photos found for this person.'
                      : 'Your photos are being prepared. Please check back soon!'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              // Unsplash-style masonry using CSS columns
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                {photosToDisplay.map((photo) => (
                  <div
                    key={photo.id}
                    className="mb-4 break-inside-avoid relative group cursor-zoom-in overflow-hidden rounded-xl bg-muted/20 shadow-sm ring-1 ring-black/5 hover:shadow-md transition"
                    onClick={() => openLightbox(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title || 'Photo'}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* Hover overlay */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 px-1">
                        <div className="truncate text-white/90 text-sm font-medium drop-shadow">
                          {photo.title || 'Photo'}
                        </div>
                        <div className="pointer-events-auto">
                          <Button
                            variant="glass"
                            size="sm"
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              openLightbox(photo);
                            }}
                          >
                            <Camera className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={closeLightbox}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation Arrows */}
            {photosToDisplay.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhoto('prev');
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhoto('next');
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title || 'Photo'}
              className="max-w-full max-h-full object-contain"
            />

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <Button
                variant="secondary"
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
              {currentPhotoIndex + 1} of {photosToDisplay.length || 0}
            </div>
          </div>
        </div>
      )}

      {/* Note: Bulk upload is for admin only and is available in the Photo Management page */}
    </div>
  );
};
