'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ProductCard } from '@/components/product-card';
import { PRODUCTS, PHONE_NUMBERS, Product, ProductsPageResponse } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { useSpotlight } from '@/lib/use-scroll-fx';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Download,
  MessageCircle,
  ZoomIn,
  ShieldCheck,
  Truck,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Script from 'next/script';
import { createElement, useEffect, useMemo, useState } from 'react';

type DetailTab = 'description' | 'specs' | 'video' | 'model3d';

function ProductDetailContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openZoom, setOpenZoom] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('description');
  const { addItem } = useCart();

  useSpotlight();

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const productResponse = await fetch(`/api/products/${productId}`, {
          signal: controller.signal,
        });
        if (!productResponse.ok) throw new Error('Error API');
        const productData = (await productResponse.json()) as Product;
        setProduct(productData);

        const relatedResponse = await fetch(
          `/api/products?paginated=1&category=${encodeURIComponent(productData.category)}&perPage=5`,
          { signal: controller.signal }
        );
        if (relatedResponse.ok) {
          const relatedPayload = (await relatedResponse.json()) as ProductsPageResponse;
          const items = Array.isArray(relatedPayload.items) ? relatedPayload.items : [];
          setRelatedProducts(items.filter((item) => item.id !== productData.id).slice(0, 4));
        }
      } catch {
        const fallbackProduct = PRODUCTS.find((item) => item.id === productId) || null;
        setProduct(fallbackProduct);
        setRelatedProducts(
          fallbackProduct
            ? PRODUCTS.filter(
                (item) => item.id !== fallbackProduct.id && item.category === fallbackProduct.category
              ).slice(0, 4)
            : []
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false);
        }
      }
    };

    void loadProducts();
    return () => controller.abort();
  }, [productId]);

  const images = useMemo(() => {
    if (!product) return [] as string[];
    const list = product.images && product.images.length > 0 ? product.images : [product.image];
    return list.filter(Boolean);
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
    setActiveTab('description');
  }, [productId]);

  const handleAddCart = () => {
    addItem(productId);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleDownloadFicha = () => {
    if (!product) return;
    const text = [
      `ROCKINK IMM — FICHA TECNICA`,
      `====================================`,
      `Producto: ${product.name}`,
      `Categoria: ${product.category}`,
      product.brand ? `Marca: ${product.brand}` : '',
      `Disponibilidad: ${product.inStock !== false ? 'En stock' : 'Consultar disponibilidad'}`,
      '',
      `Descripcion:`,
      product.description,
      '',
      'Especificaciones tecnicas:',
      ...product.specifications.map((s, i) => `${i + 1}. ${s}`),
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha-${product.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const youtubeId = product?.youtubeId?.trim() || '';
  const hasValidVideo = Boolean(youtubeId && youtubeId !== 'dQw4w9WgXcQ');
  const model3dUrl = product?.model3dEmbedUrl?.trim() || '';
  const has3dModel = /^https?:\/\/.+/i.test(model3dUrl);
  const isGlbModel = /\.glb(\?|$)/i.test(model3dUrl);

  useEffect(() => {
    if (activeTab === 'model3d' && !has3dModel) {
      setActiveTab('description');
    }
    if (activeTab === 'video' && !hasValidVideo) {
      setActiveTab('description');
    }
  }, [activeTab, has3dModel, hasValidVideo]);

  if (isLoadingProducts) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="ap-shell pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="h-[420px] rounded-2xl bg-muted animate-pulse" />
            <div className="space-y-4 py-4">
              <div className="h-6 w-32 rounded-full bg-muted animate-pulse" />
              <div className="h-10 w-3/4 rounded-xl bg-muted animate-pulse" />
              <div className="h-24 w-full rounded-xl bg-muted animate-pulse" />
              <div className="h-14 w-full rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="ap-shell pt-36 pb-24 text-center">
          <p className="ap-overline">Catalogo</p>
          <h1 className="ap-title2 mt-3">Producto no encontrado</h1>
          <p className="ap-sub mt-3 max-w-md mx-auto">
            El equipo que buscas no esta disponible o cambio de ubicacion en el catalogo.
          </p>
          <Link href="/store" className="inline-block mt-8">
            <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la tienda
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const currentImage = images[activeImageIndex] || '/placeholder.svg';
  const waPhone = PHONE_NUMBERS.tier1.replace(/\D/g, '');
  const waText = encodeURIComponent(
    `Hola Rockink IMM, quiero cotizar e informacion tecnica del equipo: ${product.name} (ID: ${product.id})`
  );
  const waLink = `https://wa.me/${waPhone}?text=${waText}`;
  const inStock = product.inStock !== false;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="ap-shell mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/store" className="ap-link text-sm">
              <ArrowLeft className="w-4 h-4" />
              Volver al catalogo
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/store" className="hover:text-foreground transition-colors">
                Tienda
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">{product.category}</span>
            </div>
          </div>
        </div>

        {/* Bloque principal de producto */}
        <section className="ap-shell">
          <div className="ap-card p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-start">
              {/* Galería de imágenes */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setOpenZoom(true)}
                  className="group relative w-full h-[340px] sm:h-[440px] bg-muted rounded-2xl overflow-hidden border border-border cursor-zoom-in"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    quality={85}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/85 backdrop-blur-sm border border-border text-xs font-medium text-foreground">
                    <ZoomIn className="w-3.5 h-3.5" />
                    Ampliar
                  </span>
                </button>

                {images.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                    {images.map((img, idx) => (
                      <button
                        key={`${product.id}-${idx}`}
                        type="button"
                        data-active={idx === activeImageIndex}
                        onClick={() => setActiveImageIndex(idx)}
                        className="pd-thumb h-16 sm:h-20"
                      >
                        <Image
                          src={img}
                          alt={`${product.name} vista ${idx + 1}`}
                          fill
                          quality={70}
                          sizes="96px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Información y acciones */}
              <div className="flex flex-col space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="pd-badge" data-tone="primary">
                      {product.category}
                    </span>
                    {product.brand && <span className="pd-badge">{product.brand}</span>}
                    <span className="pd-badge" data-tone={inStock ? 'primary' : undefined}>
                      {inStock ? 'En stock' : 'Bajo pedido'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                    {product.name}
                  </h1>
                  <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Puntos clave de especificación */}
                {product.specifications.length > 0 && (
                  <div className="rounded-xl bg-muted p-4 space-y-2.5 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Puntos clave del equipo
                    </p>
                    <ul className="space-y-2">
                      {product.specifications.slice(0, 3).map((spec, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTAs principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Button
                    onClick={handleAddCart}
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold py-6"
                  >
                    {added ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Anadido al carrito
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Agregar al carrito
                      </>
                    )}
                  </Button>
                  <a href={waLink} target="_blank" rel="noreferrer" className="block">
                    <Button
                      variant="outline"
                      className="w-full rounded-full text-base font-semibold py-6 border-border hover:border-primary hover:text-primary"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Cotizar por WhatsApp
                    </Button>
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={handleDownloadFicha}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar ficha tecnica (.txt)
                  </button>
                  {added && (
                    <Link href="/cart" className="ap-link text-sm">
                      Ir al carrito
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {/* Garantías operativas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>Garantia directa</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Truck className="w-4 h-4 text-primary shrink-0" />
                    <span>Envio a nivel nacional</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Wrench className="w-4 h-4 text-primary shrink-0" />
                    <span>Soporte y repuestos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pestañas de detalle técnico */}
        <section className="ap-shell mt-8">
          <div className="ap-card p-6 sm:p-8">
            <div className="mb-6 overflow-x-auto pb-1">
              <div className="ap-segment">
                <button
                  type="button"
                  data-active={activeTab === 'description'}
                  onClick={() => setActiveTab('description')}
                >
                  Descripcion
                </button>
                <button
                  type="button"
                  data-active={activeTab === 'specs'}
                  onClick={() => setActiveTab('specs')}
                >
                  Especificaciones ({product.specifications.length})
                </button>
                {hasValidVideo && (
                  <button
                    type="button"
                    data-active={activeTab === 'video'}
                    onClick={() => setActiveTab('video')}
                  >
                    Video demostrativo
                  </button>
                )}
                {has3dModel && (
                  <button
                    type="button"
                    data-active={activeTab === 'model3d'}
                    onClick={() => setActiveTab('model3d')}
                  >
                    Modelo 3D
                  </button>
                )}
              </div>
            </div>

            {activeTab === 'description' && (
              <div className="max-w-3xl space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Acerca de este equipo</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-3xl">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Especificaciones tecnicas
                </h2>
                {product.specifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {product.specifications.map((spec, idx) => (
                      <div key={idx} className="pd-spec-row">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-foreground text-sm sm:text-base">{spec}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Consulta por WhatsApp para recibir la hoja tecnica completa del fabricante.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'video' && hasValidVideo && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Video del equipo</h2>
                <div className="aspect-video bg-muted rounded-xl overflow-hidden border border-border">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={`Video de ${product.name}`}
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
                <h2 className="text-lg font-semibold text-foreground">Vista 3D interactiva</h2>
                {isGlbModel ? (
                  <>
                    <Script
                      type="module"
                      src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
                      strategy="afterInteractive"
                    />
                    <div className="w-full h-[440px] rounded-xl overflow-hidden bg-muted border border-border">
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
                  <div className="aspect-video bg-muted rounded-xl overflow-hidden border border-border">
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
          </div>
        </section>

        {/* Productos relacionados */}
        <section className="ap-shell mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="ap-overline">Misma linea</p>
              <h2 className="ap-title2 mt-2">Equipos relacionados</h2>
            </div>
            <Link href="/store" className="ap-link text-sm">
              Ver catalogo completo
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <div className="ap-card p-8 text-center">
              <p className="text-muted-foreground">No hay otros equipos en esta categoria por ahora.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <Dialog open={openZoom} onOpenChange={setOpenZoom}>
        <DialogContent className="sm:max-w-4xl p-2 bg-background border-border">
          <div className="relative w-full h-[70vh] rounded-xl overflow-hidden bg-muted">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              quality={90}
              sizes="100vw"
              className="object-contain p-4"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';

  return <ProductDetailContent productId={id} />;
}
