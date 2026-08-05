'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (images.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
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
    <article
      onClick={() => router.push(`/product/${product.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="ap-card group h-full flex flex-col overflow-hidden cursor-pointer"
    >
      <div className="relative w-full h-52 sm:h-56 bg-muted overflow-hidden">
        <Image
          src={images[currentImageIndex] || '/placeholder.svg'}
          alt={product.name}
          fill
          loading="lazy"
          quality={70}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          onLoad={() => setImageLoaded(true)}
          className={`object-cover transition-all duration-700 ease-out ${
            isHovered ? 'scale-105' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="bg-background/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full text-[11px] font-semibold border border-border">
            {product.category}
          </span>
          {product.inOffer && (
            <span className="bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-[11px] font-semibold">
              Oferta
            </span>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Imagen anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-background text-foreground p-1.5 rounded-full shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Imagen siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-background text-foreground p-1.5 rounded-full shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-foreground w-4' : 'bg-foreground/30 w-2'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-semibold text-foreground group-hover:text-primary mb-2 line-clamp-2 transition-colors duration-200">
          {product.name}
        </h3>

        <p className="text-sm text-muted-foreground mb-5 line-clamp-2 flex-grow leading-relaxed">
          {product.description}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="rounded-full text-sm"
          >
            Vista rapida
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product.id);
              onAddedToCart?.(product);
            }}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm w-full"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            Anadir
          </Button>
        </div>
      </div>
    </article>
  );
}
