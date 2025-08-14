import React, { useState, useEffect } from 'react';
import { DetectedFace, getSpaceFaces } from '../../api';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { User } from 'lucide-react';

interface FaceGalleryProps {
    spaceId: string;
    onFaceSelect: (face: DetectedFace | null) => void;
    selectedFace: DetectedFace | null;
}

export const FaceGallery: React.FC<FaceGalleryProps> = ({
    spaceId,
    onFaceSelect,
    selectedFace,
}) => {
    const [faces, setFaces] = useState<DetectedFace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFaces = async () => {
            try {
                setLoading(true);
                setError(null);
                const detectedFaces = await getSpaceFaces(spaceId);
                setFaces(detectedFaces);
            } catch (err) {
                console.error('Error loading faces:', err);
                setError('Failed to load faces');
            } finally {
                setLoading(false);
            }
        };

        if (spaceId) {
            loadFaces();
        }
    }, [spaceId]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="p-4 animate-pulse">
                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mx-auto w-12"></div>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (faces.length === 0) {
        return (
            <div className="text-center py-8">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No faces detected in this gallery yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                    Face recognition will automatically process new photos as they are uploaded.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Clear Selection Button */}
            {selectedFace && (
                <div className="mb-4">
                    <button
                        onClick={() => onFaceSelect(null)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                        ← Show All Photos
                    </button>
                </div>
            )}

            {/* Faces Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {faces.map((face) => (
                    <Card
                        key={face.id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedFace?.id === face.id
                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                : 'hover:shadow-lg'
                            }`}
                        onClick={() => onFaceSelect(face)}
                    >
                        <div className="flex flex-col items-center space-y-2">
                            <Avatar className="w-20 h-20">
                                <AvatarImage
                                    src={face.thumbnailUrl}
                                    alt={`Person ${face.id}`}
                                    className="object-cover"
                                />
                                <AvatarFallback>
                                    <User className="w-8 h-8" />
                                </AvatarFallback>
                            </Avatar>

                            <Badge variant="secondary" className="text-xs">
                                {face.photoCount} photo{face.photoCount !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Selected Face Info */}
            {selectedFace && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                            <AvatarImage
                                src={selectedFace.thumbnailUrl}
                                alt="Selected person"
                                className="object-cover"
                            />
                            <AvatarFallback>
                                <User className="w-6 h-6" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-medium text-blue-900">
                                Showing photos with this person
                            </h3>
                            <p className="text-sm text-blue-700">
                                {selectedFace.photoCount} photo{selectedFace.photoCount !== 1 ? 's' : ''} found
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaceGallery;
