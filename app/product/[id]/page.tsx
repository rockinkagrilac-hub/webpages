'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PRODUCTS, PHONE_NUMBERS, Product } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { CartProvider } from '@/lib/cart-context';
import { ArrowLeft, ShoppingCart, Check, Download, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { createElement, use, useEffect, useMemo, useState } from 'react';

type DetailTab = 'description' | 'specs' | 'video' | 'model3d';

function ProductDetailContent({ productId }: { productId: string }) {
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openZoom, setOpenZoom] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('description');
  const { addItem } = useCart();

  const product = allProducts.find((p) => p.id === productId);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        if (!response.ok) throw new Error('Error API');
        const data = (await response.json()) as Product[];
        setAllProducts(data);
      } catch {
        setAllProducts(PRODUCTS);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    void loadProducts();
  }, []);

  const images = useMemo(() => {
    if (!product) return [] as string[];
    return product.images && product.images.length > 0 ? product.images : [product.image];
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
    setActiveTab('description');
  }, [productId]);

  const relatedProducts = useMemo(() => {
    if (!product) return [] as Product[];
    return allProducts
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
  }, [allProducts, product]);

  const handleAddCart = () => {
    addItem(productId);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleDownloadFicha = () => {
    if (!product) return;
    const text = [
      `Producto: ${product.name}`,
      `Categoria: ${product.category}`,
      `Descripcion: ${product.description}`,
      '',
      'Especificaciones:',
      ...product.specifications.map((s, i) => `${i + 1}. ${s}`),
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha-${product.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const model3dUrl = product?.model3dEmbedUrl?.trim() || '';
  const has3dModel = /^https?:\/\/.+/i.test(model3dUrl);
  const isGlbModel = /\.glb(\?|$)/i.test(model3dUrl);

  useEffect(() => {
    if (activeTab === 'model3d' && !has3dModel) {
      setActiveTab('video');
    }
  }, [activeTab, has3dModel]);

  if (isLoadingProducts) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-primary">Producto no encontrado</h1>
          <Link href="/store">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = images[activeImageIndex] || '/placeholder.svg';
  const waPhone = PHONE_NUMBERS.tier1.replace(/\D/g, '');
  const waText = encodeURIComponent(
    `Hola Rockink IMM, quiero informacion de este producto: ${product.name} (ID: ${product.id})`
  );
  const waLink = `https://wa.me/${waPhone}?text=${waText}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link href="/store" className="text-primary hover:text-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <Card className="border-border/60">
          <CardContent className="p-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setOpenZoom(true)}
                  className="relative w-full h-[340px] sm:h-[460px] bg-card rounded-xl overflow-hidden border border-border"
                >
                  <Image src={currentImage} alt={product.name} fill className="object-cover" />
                </button>
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={`${product.id}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 sm:h-20 rounded-md overflow-hidden border ${
                        idx === activeImageIndex ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold mb-3">
                    {product.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{product.name}</h1>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <Card key={i} className="border-primary/20">
                      <CardContent className="p-3">
                        <p className="text-sm line-clamp-2">
                          {product.specifications[i] || 'Calidad premium para mejor rendimiento'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div>
                  {product.inStock ? (
                    <span className="text-green-600 font-semibold flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      En stock
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">Agotado</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={handleAddCart}
                    disabled={!product.inStock}
                    className="bg-primary hover:bg-primary/90 text-base py-6"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {added ? 'Agregado' : 'Agregar al carrito'}
                  </Button>
                  <a href={waLink} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full text-base py-6">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                </div>

                <Button onClick={handleDownloadFicha} variant="ghost" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar ficha tecnica
                </Button>

                {added && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-center">
                    Producto agregado exitosamente
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-2">
        <Card className="border-border/60">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  activeTab === 'description'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                Descripcion
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  activeTab === 'specs'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                Especificaciones
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  activeTab === 'video'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                Video
              </button>
              {has3dModel && (
                <button
                  type="button"
                  onClick={() => setActiveTab('model3d')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                    activeTab === 'model3d'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  Modelo 3D
                </button>
              )}
            </div>

            {activeTab === 'description' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-primary">Descripcion del producto</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-primary">Especificaciones tecnicas</h2>
                <ul className="space-y-2">
                  {product.specifications.map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{spec}</span>
                    </li>
                ))}
              </ul>
            </div>
          )}

            {activeTab === 'video' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-primary">Video del producto</h2>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${product.youtubeId}`}
                    title="Video del producto"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {activeTab === 'model3d' && has3dModel && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-primary">Modelo 3D</h2>
                {isGlbModel ? (
                  <>
                    <Script
                      type="module"
                      src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
                      strategy="afterInteractive"
                    />
                    <div className="w-full h-[440px] rounded-lg overflow-hidden bg-black/80 border border-border">
                      {createElement('model-viewer', {
                        src: model3dUrl,
                        alt: `Modelo 3D de ${product.name}`,
                        poster: product.image,
                        class: 'w-full h-full',
                        style: { width: '100%', height: '100%' },
                        'camera-controls': true,
                        'auto-rotate': true,
                        'auto-rotate-delay': '1200',
                        'shadow-intensity': '1',
                        'interaction-prompt': 'auto',
                      })}
                    </div>
                  </>
                ) : (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={model3dUrl}
                      title="Modelo 3D del producto"
                      frameBorder="0"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Productos relacionados</h2>
          <Link href="/store" className="text-sm text-primary underline">
            Ver mas
          </Link>
        </div>

        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`} className="group">
                <Card className="overflow-hidden h-full border-border/60 hover:border-primary/50 transition-colors">
                  <div className="relative h-40 w-full">
                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                    <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No hay productos relacionados por ahora.</p>
        )}
      </section>

      <footer className="bg-primary text-primary-foreground py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2">© 2026 Rockink IMM - E-commerce Agropecuario</p>
          <p className="text-sm opacity-75">Productos de calidad para tu campo</p>
        </div>
      </footer>

      <Dialog open={openZoom} onOpenChange={setOpenZoom}>
        <DialogContent className="sm:max-w-4xl p-2">
          <div className="relative w-full h-[70vh] rounded-md overflow-hidden bg-black">
            <Image src={currentImage} alt={product.name} fill className="object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <CartProvider>
      <ProductDetailContent productId={id} />
    </CartProvider>
  );
}
