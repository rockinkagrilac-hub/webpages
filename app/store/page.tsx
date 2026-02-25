'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PRODUCTS, Product } from '@/lib/data';
import { getCategories, mergeCategoriesWithProducts } from '@/lib/categories';
import { getProductBrand, normalizeBrandName, productMatchesBrand } from '@/lib/product-brand';
import { CartProvider, useCart } from '@/lib/cart-context';
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react';

const CATEGORY_TREE = [
  { label: 'Consumibles' },
  { label: 'Hormonas' },
  { label: 'Inseminación Artificial Bovinos' },
  { label: 'Inseminación Artificial Ovinos' },
  {
    label: 'Línea de Ecógrafos',
    children: ['MARCA BMV', 'MARCA DRAMINSKI', 'MARCA IMV'],
  },
  {
    label: 'Materiales y Accesorios',
    children: ['Alimentadores para terneros', 'Equipos Detectores Draminski', 'Trampa para moscas'],
  },
  {
    label: 'Medios',
    children: ['OPU', 'Equipos'],
  },
  {
    label: 'Producción de Semen',
    children: ['Análisis de semen', 'Electro eyaculador', 'Llenado de impresión de pajillas'],
  },
  { label: 'Sin categorizar' },
  {
    label: 'Transferencia de embriones',
    children: ['Neovet', 'WTA'],
  },
];

function isPajillaToroProduct(product: Product) {
  const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
  return /\bpajillas?\b|\bsemen\b|\btoros?\b|\binseminaci[oó]n\b|\bia\b/.test(text);
}

function StoreContent() {
  const PRODUCTS_PER_PAGE = 16;
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [isPajillasView, setIsPajillasView] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [storedCategories, setStoredCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [treeSearchTerm, setTreeSearchTerm] = useState('');
  const [selectedTreeFilters, setSelectedTreeFilters] = useState<string[]>([]);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'name_asc' | 'name_desc'>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        if (!response.ok) throw new Error('Error API');
        const data = (await response.json()) as Product[];
        setAllProducts(data);
      } catch {
        setAllProducts(PRODUCTS);
      }
    };

    void loadProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const brandParam = params.get('brand');
    const viewParam = params.get('view');
    setSelectedBrand(brandParam ? normalizeBrandName(brandParam) : null);
    setIsPajillasView(viewParam === 'pajillas');
  }, []);

  useEffect(() => {
    // Evita hydration mismatch: localStorage solo se lee despues de montar en cliente.
    setStoredCategories(getCategories());
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(''), 2200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const categories = useMemo(
    () => mergeCategoriesWithProducts(allProducts.map((p) => p.category), storedCategories),
    [allProducts, storedCategories]
  );

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const treeQ = selectedTreeFilters.map((v) => v.toLowerCase());
    const base = allProducts.filter((p) => {
      const text = `${p.name} ${p.description} ${p.category}`.toLowerCase();
      if (isPajillasView && !isPajillaToroProduct(p)) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedBrand && !productMatchesBrand(p, selectedBrand)) return false;
      if (onlyOffers && !p.inOffer) return false;
      if (treeQ.length > 0 && !treeQ.some((token) => text.includes(token))) return false;
      if (!q) return true;
      return (
        text.includes(q)
      );
    });

    if (sortBy === 'name_asc') return [...base].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (sortBy === 'name_desc') return [...base].sort((a, b) => b.name.localeCompare(a.name, 'es'));
    return base;
  }, [allProducts, isPajillasView, selectedCategory, selectedBrand, onlyOffers, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const categoryPreviews = useMemo(
    () =>
      categories.map((category) => {
        const sample =
          allProducts.find((p) => p.category === category && p.image) ||
          allProducts.find((p) => p.category === category) ||
          null;
        return {
          category,
          image: sample?.image || '/placeholder.svg',
        };
      }),
    [categories, allProducts]
  );

  const handleAddedToCart = (product: Product) => {
    setToastMessage(`${product.name} agregado al carrito`);
  };

  const quickViewImages = quickViewProduct?.images?.length
    ? quickViewProduct.images.slice(0, 2)
    : quickViewProduct
    ? [quickViewProduct.image]
    : [];
  const availableBrands = Array.from(new Set(allProducts.map((p) => getProductBrand(p))));
  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (onlyOffers ? 1 : 0) +
    (isPajillasView ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0) +
    selectedTreeFilters.length;
  const quickCategories = categories.slice(0, 6);
  const filteredTree = useMemo(() => {
    const q = treeSearchTerm.trim().toLowerCase();
    if (!q) return CATEGORY_TREE;
    return CATEGORY_TREE.filter((item) => {
      if (item.label.toLowerCase().includes(q)) return true;
      return item.children?.some((child) => child.toLowerCase().includes(q));
    });
  }, [treeSearchTerm]);

  const toggleTreeFilter = (value: string) => {
    setSelectedTreeFilters((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, isPajillasView, onlyOffers, sortBy, searchTerm, treeSearchTerm, selectedTreeFilters.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-8 text-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 sm:mb-6">
            {isPajillasView ? (
              <>
                Vista <span className="text-primary">Pajillas de Toros</span>
              </>
            ) : (
              <>
                Tienda <span className="text-primary">Completa</span>
              </>
            )}
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl">
            Explora nuestro catalogo completo de productos agropecuarios premium. {allProducts.length} productos disponibles.
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
            <div className="rounded-xl border bg-background/80 px-4 py-3">
              <p className="text-xs text-muted-foreground">Productos</p>
              <p className="text-xl font-bold text-foreground">{allProducts.length}</p>
            </div>
            <div className="rounded-xl border bg-background/80 px-4 py-3">
              <p className="text-xs text-muted-foreground">Categorías</p>
              <p className="text-xl font-bold text-foreground">{categories.length}</p>
            </div>
            <div className="rounded-xl border bg-background/80 px-4 py-3">
              <p className="text-xs text-muted-foreground">Marcas</p>
              <p className="text-xl font-bold text-foreground">{availableBrands.length}</p>
            </div>
            <div className="rounded-xl border bg-background/80 px-4 py-3">
              <p className="text-xs text-muted-foreground">Resultados</p>
              <p className="text-xl font-bold text-primary">{filteredProducts.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-8 bg-background" id="products">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-24 self-start">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-semibold text-foreground mb-3">Buscar por categoría</p>
              <input
                type="text"
                value={treeSearchTerm}
                onChange={(e) => setTreeSearchTerm(e.target.value)}
                placeholder="Buscar por categoría"
                className="w-full px-3 py-2 rounded-md border border-input bg-background mb-3"
              />
              <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
                {filteredTree.map((item) => (
                  <div key={`tree-${item.label}`} className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={selectedTreeFilters.includes(item.label)}
                        onChange={() => toggleTreeFilter(item.label)}
                        className="h-4 w-4 rounded border-input"
                      />
                      {item.label}
                    </label>
                    {item.children?.map((child) => (
                      <label key={`tree-${item.label}-${child}`} className="ml-6 flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={selectedTreeFilters.includes(child)}
                          onChange={() => toggleTreeFilter(child)}
                          className="h-4 w-4 rounded border-input"
                        />
                        {child}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="font-semibold text-foreground">Marcas</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedBrand === null ? 'default' : 'outline'}
                  onClick={() => setSelectedBrand(null)}
                  className="rounded-full h-8 px-3 text-xs"
                >
                  Todas
                </Button>
                {availableBrands.slice(0, 16).map((brand) => (
                  <Button
                    key={brand}
                    variant={selectedBrand === brand ? 'default' : 'outline'}
                    onClick={() => setSelectedBrand(brand)}
                    className="rounded-full h-8 px-3 text-xs"
                  >
                    {brand}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant={onlyOffers ? 'default' : 'outline'}
                  onClick={() => setOnlyOffers((v) => !v)}
                  className="rounded-full h-8 px-3 text-xs"
                >
                  Solo ofertas
                </Button>
                <Link href={isPajillasView ? '/store' : '/store?view=pajillas'}>
                  <Button variant={isPajillasView ? 'default' : 'outline'} className="rounded-full h-8 px-3 text-xs">
                    {isPajillasView ? 'Vista completa' : 'Pajillas'}
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, descripción o categoría"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full h-8 px-3 text-xs"
                >
                  Todos
                </Button>
                {quickCategories.map((category) => (
                  <Button
                    key={`quick-${category}`}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full h-8 px-3 text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'name_asc' | 'name_desc')}
                  className="h-10 rounded-full border border-input bg-background px-4 text-sm"
                >
                  <option value="relevance">Orden: Relevancia</option>
                  <option value="name_asc">Orden: Nombre A-Z</option>
                  <option value="name_desc">Orden: Nombre Z-A</option>
                </select>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedBrand(null);
                      setSearchTerm('');
                      setTreeSearchTerm('');
                      setSelectedTreeFilters([]);
                      setOnlyOffers(false);
                      setIsPajillasView(false);
                      setSortBy('relevance');
                    }}
                    className="rounded-full"
                  >
                    Limpiar filtros ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {categoryPreviews.slice(0, 8).map((item) => (
                <button
                  key={`preview-${item.category}`}
                  type="button"
                  onClick={() => setSelectedCategory(item.category)}
                  className="group relative h-28 sm:h-32 rounded-xl overflow-hidden border border-border/40 text-left"
                >
                  <Image
                    src={item.image}
                    alt={item.category}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <p className="text-white text-xs sm:text-sm font-semibold line-clamp-1">{item.category}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-2">
              <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
                {selectedCategory ? (
                  <>
                    Productos en <span className="text-primary">{selectedCategory}</span>
                  </>
                ) : (
                  <>
                    Todos Nuestros <span className="text-primary">Productos</span>
                  </>
                )}
              </h2>
              <p className="text-base text-muted-foreground">
                {filteredProducts.length} productos disponibles
                {filteredProducts.length > 0 && (
                  <span>{` · Página ${currentPage} de ${totalPages}`}</span>
                )}
              </p>
              {selectedBrand && (
                <p className="text-sm text-primary mt-1">Filtrando por marca: {selectedBrand}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedProducts.map((product, idx) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  <ProductCard
                    product={product}
                    onQuickView={setQuickViewProduct}
                    onAddedToCart={handleAddedToCart}
                  />
                </div>
              ))}
            </div>

            {filteredProducts.length > PRODUCTS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full"
                >
                  ←
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5)
                  .map((page) => (
                    <Button
                      key={`page-${page}`}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className="h-9 w-9 rounded-md p-0"
                    >
                      {page}
                    </Button>
                  ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full"
                >
                  →
                </Button>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-24">
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  No hay productos con esos filtros
                </h3>
                <p className="text-xl text-muted-foreground mb-8">
                  Prueba cambiando categoría, texto o filtros.
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedBrand(null);
                    setSearchTerm('');
                    setTreeSearchTerm('');
                    setSelectedTreeFilters([]);
                    setOnlyOffers(false);
                    setIsPajillasView(false);
                    setSortBy('relevance');
                  }}
                  className="premium-button bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog
        open={Boolean(quickViewProduct)}
        onOpenChange={(open) => {
          if (!open) setQuickViewProduct(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          {quickViewProduct && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle>{quickViewProduct.name}</DialogTitle>
                <DialogDescription>{quickViewProduct.category}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickViewImages.map((img, idx) => (
                  <div key={`${quickViewProduct.id}-${idx}`} className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={img || '/placeholder.svg'}
                      alt={`${quickViewProduct.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">{quickViewProduct.description}</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/product/${quickViewProduct.id}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">Ver detalle completo</Button>
                </Link>
                <Button
                  onClick={() => {
                    addItem(quickViewProduct.id);
                    setToastMessage(`${quickViewProduct.name} agregado al carrito`);
                  }}
                  className="w-full sm:w-auto"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Agregar al carrito
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-primary/20 bg-background px-4 py-3 shadow-xl">
          <p className="text-sm font-medium text-foreground">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}

export default function Store() {
  return (
    <CartProvider>
      <StoreContent />
    </CartProvider>
  );
}

