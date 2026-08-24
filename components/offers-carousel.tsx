'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/data';
import { ProductCard } from './product-card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OffersCarouselProps {
  products: Product[];
}

export function OffersCarousel({ products }: OffersCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else if (window.innerWidth < 1280) setItemsPerView(3);
      else setItemsPerView(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!autoplay || products.length <= itemsPerView) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (products.length - itemsPerView + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [autoplay, products.length, itemsPerView]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % (products.length - itemsPerView + 1));
    setAutoplay(false);
  };

  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? products.length - itemsPerView : prev - 1
    );
    setAutoplay(false);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay ofertas disponibles</p>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0"
                style={{ width: `calc(100% / ${itemsPerView})` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-10 p-2 hover:bg-primary/20 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-10 p-2 hover:bg-primary/20 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6 text-primary" />
        </button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({
          length: Math.max(1, products.length - itemsPerView + 1),
        }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i);
              setAutoplay(false);
            }}
            className={`h-2 rounded-full transition-all ${
              i === currentIndex
                ? 'bg-primary w-8'
                : 'bg-gray-300 w-2 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
