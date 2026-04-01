'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddedToCart?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView, onAddedToCart }: ProductCardProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  useEffect(() => {
    setImageLoaded(false);
  }, [currentImageIndex, product.id]);
  const handleTiltMove = (event: React.MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -9;
    const rotateY = ((x / rect.width) - 0.5) * 9;
    el.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
    el.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
    el.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
  };

  const handleTiltLeave = (event: React.MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
    el.style.setProperty('--glow-x', '50%');
    el.style.setProperty('--glow-y', '50%');
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  const handleTiltEnter = () => {
    setIsHovered(true);
    if (images.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card
      onClick={() => router.push(`/product/${product.id}`)}
      onMouseEnter={handleTiltEnter}
      onMouseMove={handleTiltMove}
      onMouseLeave={handleTiltLeave}
      className="interactive-tilt tilt-card overflow-hidden card-hover h-full flex flex-col border border-border/40 shadow-sm hover:shadow-xl hover:border-primary/20 cursor-pointer transition-all duration-300"
    >
      <div className="shader-energy-wrap image-liquid-reveal relative w-full h-52 sm:h-56 bg-gradient-to-br from-muted to-muted/50 overflow-hidden group">
        <Image
          src={images[currentImageIndex] || '/placeholder.svg'}
          alt={product.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          onLoad={() => setImageLoaded(true)}
          className={`magnetic-image moving-product-image object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-105' : 'scale-100'} ${imageLoaded ? 'is-loaded' : ''}`}
        />
        <div className={`mosaic-mask ${imageLoaded ? 'is-hidden' : ''}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
          <Tag className="w-3 h-3" />
          {product.category}
        </div>
        {product.inOffer && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-[11px] font-bold shadow-lg">
            Oferta
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/55 hover:bg-black/70 text-white p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/55 hover:bg-black/70 text-white p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full ${
                    idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 w-2'
                  } transition-all`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-0 opacity-100 sm:translate-y-6 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
          <div className="rounded-md bg-black/55 text-white text-xs px-3 py-2 backdrop-blur-sm">
            Toca para ver más detalles
          </div>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-foreground hover:text-primary mb-2 line-clamp-2 transition-colors duration-200">
          {product.name}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow leading-relaxed">
          {product.description}
        </p>

        <div className="pt-2 border-t border-border/30">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView?.(product);
              }}
              className="text-sm"
            >
              Vista rápida
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                addItem(product.id);
                onAddedToCart?.(product);
              }}
              className="btn-primary shadow-md text-sm w-full"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
