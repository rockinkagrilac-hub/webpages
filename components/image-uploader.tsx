'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Link as LinkIcon, Star, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
  productName?: string;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  folder = 'productos',
  productName,
}: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const compressImage = (src: string, mimeType = 'image/webp'): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1400;
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        // Fondo blanco para evitar que PNGs transparentes queden con fondo negro
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL('image/webp', 0.80);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = src;
    });

  const uploadSingleFile = async (file: File, indexOffset: number): Promise<string> => {
    const raw = await readFileAsDataUrl(file);
    // Los SVG se suben tal cual sin pasar por canvas
    const dataUrl = file.type === 'image/svg+xml' ? raw : await compressImage(raw, file.type);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl,
          folder,
          productName: productName?.trim() || file.name.replace(/\.[^.]+$/, ''),
          index: images.length + indexOffset,
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as { url?: string };
        if (payload?.url) return payload.url;
      }
    } catch {
      /* Si falla la subida directa, se conserva el dataUrl comprimido que el backend subirá al guardar */
    }

    return dataUrl;
  };

  const processFiles = async (fileList: FileList | File[]) => {
    setUploadError(null);
    const availableSlots = Math.max(0, maxImages - images.length);
    if (availableSlots <= 0) {
      setUploadError(`Ya alcanzaste el límite de ${maxImages} imágenes.`);
      return;
    }

    const selected = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, availableSlots);

    if (selected.length === 0) {
      setUploadError('Selecciona archivos de imagen válidos (JPG, PNG, WEBP, SVG).');
      return;
    }

    setIsLoading(true);
    try {
      const uploadedUrls = await Promise.all(
        selected.map((file, idx) => uploadSingleFile(file, idx))
      );
      onImagesChange([...images, ...uploadedUrls]);
    } catch {
      setUploadError('No se pudieron procesar algunas imágenes. Intenta con otro archivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (input.files && input.files.length > 0) {
      await processFiles(input.files);
    }
    input.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (images.length >= maxImages || isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = () => {
    setUploadError(null);
    const clean = urlInput.trim();
    if (!clean) return;
    if (images.length >= maxImages) {
      setUploadError(`Ya alcanzaste el límite de ${maxImages} imágenes.`);
      return;
    }
    if (!/^https?:\/\/.+/i.test(clean) && !clean.startsWith('/')) {
      setUploadError('Ingresa una URL válida que empiece con https:// o /');
      return;
    }
    onImagesChange([...images, clean]);
    setUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    const picked = images[index];
    const rest = images.filter((_, i) => i !== index);
    onImagesChange([picked, ...rest]);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-foreground">
            Imágenes del producto ({images.length}/{maxImages})
          </label>
          {images.length > 1 && (
            <span className="text-xs text-muted-foreground">
              La primera imagen es la portada principal
            </span>
          )}
        </div>

        {/* Zona Drag & Drop + Selector de archivo */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDragging) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`relative block border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-primary/60 hover:border-primary hover:bg-primary/5'
          } ${images.length >= maxImages || isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            type="file"
            multiple={maxImages > 1}
            accept="image/*"
            onChange={handleImageUpload}
            disabled={images.length >= maxImages || isLoading}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2 text-center">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-primary" />
            )}
            <span className="font-semibold text-foreground">
              {isLoading ? 'Subiendo y optimizando imágenes...' : 'Haz clic o arrastra imágenes aquí'}
            </span>
            <span className="text-xs text-muted-foreground">
              {images.length >= maxImages
                ? 'Límite de imágenes alcanzado'
                : 'Soporta JPG, PNG, WEBP y SVG · Se optimizan y guardan en la nube automáticamente'}
            </span>
          </div>
        </label>

        {/* Opción alternativa: pegar URL externa */}
        <div className="mt-3 flex gap-2">
          <div className="relative flex-grow">
            <LinkIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              placeholder="O pega la URL directa de una imagen (https://...)"
              disabled={images.length >= maxImages || isLoading}
              className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg bg-background"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddUrl}
            disabled={!urlInput.trim() || images.length >= maxImages || isLoading}
          >
            Añadir URL
          </Button>
        </div>

        {uploadError && (
          <p className="text-xs text-destructive font-medium mt-2">{uploadError}</p>
        )}
      </div>

      {/* Grilla de previsualización */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, idx) => (
            <Card
              key={`${image.slice(0, 40)}-${idx}`}
              className={`overflow-hidden ${idx === 0 ? 'ring-2 ring-primary border-primary' : ''}`}
            >
              <CardContent className="p-2 relative group">
                <div className="relative w-full h-28 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={image}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Portada
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between gap-1">
                  {idx === 0 ? (
                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                      <Star className="w-3 h-3 fill-primary" />
                      Principal
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMakePrimary(idx)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Hacer portada
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title="Eliminar imagen"
                    className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                  >
                    <X className="w-3.5 h-3.5" />
                    Quitar
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
