'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { PRODUCTS, Product } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

function CartContent() {
  const { items, removeItem, updateQuantity, getTotalItems, getPhoneNumber, clearCart } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Error API');
        const data = (await response.json()) as Product[];
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
        }
      } catch {
        /* mantiene fallback local */
      }
    };

    void loadProducts();
    return () => controller.abort();
  }, []);

  const cartProducts = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        product: allProducts.find((p) => p.id === item.productId),
      })),
    [items, allProducts]
  );

  const totalItems = getTotalItems();
  const totalProducts = cartProducts.length;
  const phoneNumber = getPhoneNumber();
  const categoriesCount = new Set(
    cartProducts.map((cp) => cp.product?.category).filter(Boolean)
  ).size;

  const whatsappMessage = encodeURIComponent(
    `Hola Rockink IMM, solicito cotizacion de los siguientes equipos:\n\n${cartProducts
      .map((cp) => `- ${cp.product?.name || 'Equipo'} (Cantidad: ${cp.quantity})`)
      .join('\n')}\n\nTotal de unidades: ${totalItems}`
  );

  const handleCheckout = () => {
    if (items.length === 0) return;

    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\s/g, '')}?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="ap-shell pt-32 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="ap-overline">Solicitud de cotizacion</p>
            <h1 className="ap-title2 mt-3">Tu carrito de equipos</h1>
          </div>
          <Link href="/store" className="ap-link text-sm">
            <ArrowLeft className="w-4 h-4" />
            Seguir explorando el catalogo
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="ap-card p-12 sm:p-16 text-center max-w-xl mx-auto">
            <span className="ap-service-icon mx-auto mb-5">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <h2 className="text-xl font-semibold text-foreground">Tu carrito esta vacio</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-8">
              Agrega equipos desde nuestro catalogo para solicitar una cotizacion directa por WhatsApp.
            </p>
            <Link href="/store">
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold">
                Explorar equipos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_0.9fr] gap-8 items-start">
            <div className="space-y-4">
              {cartProducts.map((cp) => (
                <article key={cp.productId} className="ap-card p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Link
                      href={`/product/${cp.productId}`}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-xl overflow-hidden border border-border shrink-0"
                    >
                      {cp.product && (
                        <Image
                          src={cp.product.image || '/placeholder.svg'}
                          alt={cp.product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      )}
                    </Link>

                    <div className="flex-grow min-w-0">
                      <span className="pd-badge" data-tone="primary">
                        {cp.product?.category || 'Equipo'}
                      </span>
                      <Link href={`/product/${cp.productId}`}>
                        <h3 className="mt-2 font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                          {cp.product?.name || 'Equipo seleccionado'}
                        </h3>
                      </Link>
                      {cp.product?.specifications?.[0] && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {cp.product.specifications[0]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          onClick={() => updateQuantity(cp.productId, cp.quantity - 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-foreground">
                          {cp.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          onClick={() => updateQuantity(cp.productId, cp.quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label="Eliminar producto"
                        onClick={() => removeItem(cp.productId)}
                        className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="ap-card p-6 sm:p-7 lg:sticky lg:top-28 space-y-6">
              <div>
                <p className="ap-overline">Resumen</p>
                <h2 className="text-xl font-semibold text-foreground mt-2">Solicitud de cotizacion</h2>
              </div>

              <div className="rounded-xl border border-border bg-muted p-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referencias distintas</span>
                  <span className="font-semibold text-foreground">{totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de unidades</span>
                  <span className="font-semibold text-foreground">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lineas tecnicas</span>
                  <span className="font-semibold text-foreground">{categoriesCount}</span>
                </div>
              </div>

              <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Atencion directa de ingenieria
                </p>
                <p className="text-lg font-bold text-foreground mt-1">{phoneNumber}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Tu lista de equipos se enviara lista por WhatsApp para cotizar disponibilidad, despacho y puesta en marcha.
                </p>
              </div>

              <div className="space-y-2.5">
                <Button
                  onClick={() => setShowConfirm(true)}
                  className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Solicitar cotizacion por WhatsApp
                </Button>

                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full rounded-full border-border text-muted-foreground hover:text-foreground"
                >
                  Vaciar carrito
                </Button>
              </div>
            </aside>
          </div>
        )}
      </main>

      {showConfirm && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="ap-card max-w-md w-full p-6 sm:p-8 space-y-5">
            <div>
              <p className="ap-overline">Confirmacion</p>
              <h2 className="text-2xl font-bold text-foreground mt-2">Enviar pedido por WhatsApp</h2>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Se abrira WhatsApp con nuestro equipo comercial (<strong className="text-foreground">{phoneNumber}</strong>) con el detalle de tus{' '}
              <strong className="text-foreground">{totalItems}</strong> unidades seleccionadas.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-full"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Abrir WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function CartPage() {
  return <CartContent />;
}
