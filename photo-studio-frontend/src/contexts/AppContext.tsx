import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import * as api from "../api";
import { useAuth } from "./AuthContext";

export interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface PhotoSpace {
  id: string;
  name: string;
  clientId: string;
  createdAt: string;
  shareableLink: string;
}

export interface Collection {
  id: string;
  name: string;
  spaceId: string;
  photos: Photo[];
}

export interface Photo {
  id: string; // maps to public_id from backend
  url: string;
  filename?: string;
  collectionId: string;
  uploadedAt?: string;
}

interface AppContextType {
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Data
  clients: Client[];
  photoSpaces: PhotoSpace[];
  collections: Collection[];

  // Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  addPhotoSpace: (space: Omit<PhotoSpace, 'id' | 'createdAt' | 'shareableLink'>) => Promise<void>;
  addCollection: (collection: Omit<Collection, 'id' | 'photos'>) => Promise<void>;
  uploadPhoto: (collectionId: string, file: File) => Promise<void>;
  deletePhoto: (collectionId: string, photoId: string) => Promise<void>;

  // Getters
  getClientById: (id: string) => Client | undefined;
  getSpaceById: (id: string) => PhotoSpace | undefined;
  getCollectionById: (id: string) => Collection | undefined;
  getSpacesByClientId: (clientId: string) => PhotoSpace[];
  getCollectionsBySpaceId: (spaceId: string) => Collection[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [photoSpaces, setPhotoSpaces] = useState<PhotoSpace[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Initial load: fetch clients with nested spaces/collections
  useEffect(() => {
    (async () => {
      try {
        if (!isAuthenticated) return; // require login for protected endpoints
        const data = await api.getClients();
        // Map backend to frontend shapes
        const mappedClients: Client[] = data.map((c) => ({
          id: c._id,
          name: c.name,
          email: c.email,
          createdAt: new Date().toISOString(), // backend model has no createdAt; placeholder
        }));
        setClients(mappedClients);

        const spaces: PhotoSpace[] = [];
        const cols: Collection[] = [];
        data.forEach((c) => {
          (c.spaces || []).forEach((s) => {
            spaces.push({
              id: s._id,
              name: s.name,
              clientId: typeof s.client === 'string' ? s.client : (s.client as any)?._id,
              createdAt: new Date().toISOString(),
              shareableLink: s.shareableLink,
            });
            (s.collections || []).forEach((col) => {
              cols.push({
                id: col._id,
                name: col.name,
                spaceId: s._id,
                photos: (col.photos || []).map((p) => ({
                  id: p.public_id,
                  url: p.url,
                  collectionId: col._id,
                })),
              });
            });
          });
        });
        setPhotoSpaces(spaces);
        setCollections(cols);
      } catch (e) {
        // silently ignore on first load; UI can still work
      }
    })();
  }, [isAuthenticated]);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createClient({ name: clientData.name, email: clientData.email });
      setClients(prev => [...prev, {
        id: created._id,
        name: created.name,
        email: created.email,
        createdAt: new Date().toISOString(),
      }]);
    } catch (e) {
      // no-op; UI toasts at caller level
    }
  };

  const addPhotoSpace = async (spaceData: Omit<PhotoSpace, 'id' | 'createdAt' | 'shareableLink'>) => {
    const created = await api.createSpace({ name: spaceData.name, clientId: spaceData.clientId });
    const newSpace: PhotoSpace = {
      id: created._id,
      name: created.name,
      clientId: typeof created.client === 'string' ? created.client : (created.client as any)?._id,
      createdAt: new Date().toISOString(),
      shareableLink: created.shareableLink,
    };
    setPhotoSpaces(prev => [...prev, newSpace]);
  };

  const addCollection = async (collectionData: Omit<Collection, 'id' | 'photos'>) => {
    const created = await api.createCollection(collectionData.spaceId, collectionData.name);
    const newCollection: Collection = {
      id: created._id,
      name: created.name,
      spaceId: collectionData.spaceId,
      photos: (created.photos || []).map((p) => ({ id: p.public_id, url: p.url, collectionId: created._id })),
    };
    setCollections(prev => [...prev, newCollection]);
  };

  const uploadPhoto = async (collectionId: string, file: File): Promise<void> => {
    const updated = await api.uploadPhotos(collectionId, [file]);
    setCollections(prev => prev.map(c => c.id === collectionId ? {
      ...c,
      photos: (updated.photos || []).map(p => ({ id: p.public_id, url: p.url, collectionId })),
    } : c));
  };

  const deletePhoto = async (collectionId: string, photoId: string) => {
    const updated = await api.deletePhoto(collectionId, photoId);
    setCollections(prev => prev.map(c => c.id === collectionId ? {
      ...c,
      photos: (updated.photos || []).map(p => ({ id: p.public_id, url: p.url, collectionId })),
    } : c));
  };

  const getClientById = (id: string) => clients.find(client => client.id === id);
  const getSpaceById = (id: string) => photoSpaces.find(space => space.id === id);
  const getCollectionById = (id: string) => collections.find(collection => collection.id === id);
  const getSpacesByClientId = (clientId: string) => photoSpaces.filter(space => space.clientId === clientId);
  const getCollectionsBySpaceId = (spaceId: string) => collections.filter(collection => collection.spaceId === spaceId);

  const value = {
    currentPage,
    setCurrentPage,
    clients,
    photoSpaces,
    collections,
    addClient,
    addPhotoSpace,
    addCollection,
    uploadPhoto,
    deletePhoto,
    getClientById,
    getSpaceById,
    getCollectionById,
    getSpacesByClientId,
    getCollectionsBySpaceId
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};