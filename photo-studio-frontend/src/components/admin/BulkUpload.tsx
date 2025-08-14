import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, FolderOpen } from 'lucide-react';
import * as api from '../../api';
import { useApp } from '../../contexts/AppContext';

type Photo = { id: string; url: string; title?: string };

type Props = {
    collectionId: string;
    onCompleted?: (uploaded: Photo[]) => void;
};

type QueueItem = {
    id: string;
    file: File;
    relativePath?: string;
    progress: number;
    status: 'queued' | 'uploading' | 'done' | 'error';
    error?: string;
};

const BYTES_IN_MB = 1024 * 1024;

export const BulkUpload: React.FC<Props> = ({ collectionId, onCompleted }) => {
    const { uploadPhotosMany } = useApp();
    const [items, setItems] = useState<QueueItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const totalBytes = useMemo(() => items.reduce((s, i) => s + i.file.size, 0), [items]);
    const overallProgress = useMemo(() => {
        if (!items.length) return 0;
        const sum = items.reduce((s, i) => s + i.progress, 0);
        return Math.floor(sum / items.length);
    }, [items]);

    const addFiles = useCallback((files: FileList | File[]) => {
        const now = Date.now();
        const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
        const queue: QueueItem[] = arr.map((file, idx) => ({
            id: `${now}-${idx}-${file.name}`,
            file,
            // @ts-ignore: webkitRelativePath is non-standard but widely supported
            relativePath: (file as any).webkitRelativePath || undefined,
            progress: 0,
            status: 'queued',
        }));
        setItems(prev => [...prev, ...queue]);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.items) {
            const files: File[] = [];
            for (const item of Array.from(e.dataTransfer.items)) {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                }
            }
            addFiles(files);
        } else if (e.dataTransfer.files) {
            addFiles(e.dataTransfer.files);
        }
    }, [addFiles]);

    const startUpload = useCallback(async () => {
        if (!items.length || isUploading) return;
        setIsUploading(true);

        // Batch files to match backend uploadMiddleware.array("photos", 10)
        const batchSize = 8;
        const queued = items.filter(i => i.status === 'queued');
        const batches: QueueItem[][] = [];
        for (let i = 0; i < queued.length; i += batchSize) {
            batches.push(queued.slice(i, i + batchSize));
        }

        for (const batch of batches) {
            // mark as uploading
            setItems(prev => prev.map(it => batch.some(b => b.id === it.id) ? { ...it, status: 'uploading' } : it));

            try {
                const files = batch.map(b => b.file);
                // Use context action to ensure state is refreshed in UI
                await uploadPhotosMany(collectionId, files);
                // mark as done
                setItems(prev => prev.map(it => batch.some(b => b.id === it.id) ? { ...it, status: 'done', progress: 100 } : it));
            } catch (err: any) {
                setItems(prev => prev.map(it => batch.some(b => b.id === it.id) ? { ...it, status: 'error', error: err?.message || 'Failed' } : it));
            }
        }

        setIsUploading(false);
        if (onCompleted) onCompleted([]);
    }, [items, isUploading, collectionId, onCompleted]);

    const clearQueue = () => setItems([]);

    return (
        <Card className="">
            <CardHeader>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={onDrop}
                    className="rounded-lg border border-dashed p-8 text-center bg-muted/20"
                >
                    <div className="flex flex-col items-center gap-3">
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                            Drag and drop images or select a folder
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => inputRef.current?.click()}
                                className="gap-2"
                            >
                                <FolderOpen className="h-4 w-4" />
                                Select Folder
                            </Button>
                            <input
                                ref={inputRef}
                                type="file"
                                multiple
                                className="hidden"
                                // @ts-ignore: non-standard but supported in Chromium
                                webkitdirectory="true"
                                // @ts-ignore: Firefox alternative (ignored elsewhere)
                                directory=""
                                onChange={e => {
                                    if (e.target.files) addFiles(e.target.files);
                                    e.currentTarget.value = '';
                                }}
                                accept="image/*"
                            />
                        </div>
                    </div>
                </div>

                {!!items.length && (
                    <>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                {items.length} files • {(totalBytes / BYTES_IN_MB).toFixed(1)} MB
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={clearQueue} disabled={isUploading}>
                                    Clear
                                </Button>
                                <Button onClick={startUpload} disabled={isUploading}>
                                    {isUploading ? `Uploading… ${overallProgress}%` : 'Start Upload'}
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-80 overflow-auto rounded-md border">
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 px-3 py-2 border-b last:border-b-0"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                            {item.status === 'queued' && 'Queued'}
                                            {item.status === 'uploading' && 'Uploading'}
                                            {item.status === 'done' && 'Done'}
                                            {item.status === 'error' && 'Error'}
                                        </div>
                                        <div className="truncate text-sm">
                                            {item.relativePath || item.file.name}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-40 bg-muted h-2 rounded">
                                            <div
                                                className={`h-2 rounded ${item.status === 'error' ? 'bg-destructive' : 'bg-primary'}`}
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                        {/* {item.status === 'error' && (
                      <X className="h-4 w-4 text-destructive" title={item.error} />
                    )} */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default BulkUpload;