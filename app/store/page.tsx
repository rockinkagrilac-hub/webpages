'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState, useDeferredValue } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PRODUCTS, Product, ProductsPageResponse } from '@/lib/data';
import { normalizeBrandName } from '@/lib/product-brand';
import { CartProvider, useCart } from '@/lib/cart-context';
import { ArrowLeft, Search, ShoppingCart, SlidersHorizontal, X } from 'lucide-react';

/** A partir de este numero de marcas, el panel muestra un buscador. */
const BRAND_SEARCH_THRESHOLD = 8;

function StoreContent() {
  const PRODUCTS_PER_PAGE = 16;
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [isPajillasView, setIsPajillasView] = useState(false);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [categoryPreviews, setCategoryPreviews] = useState<Array<{ category: string; image: string }>>([]);
  const [catalogTotal, setCatalogTotal] = useState(PRODUCTS.length);
  const [totalResults, setTotalResults] = useState(PRODUCTS.length);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [loadFailed, setLoadFailed] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'name_asc' | 'name_desc'>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const brandParam = params.get('brand');
    const viewParam = params.get('view');
    setSelectedBrand(brandParam ? normalizeBrandName(brandParam) : null);
    setIsPajillasView(viewParam === 'pajillas');
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(''), 2200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase());

  const quickViewImages = quickViewProduct?.images?.length
    ? quickViewProduct.images.slice(0, 2)
    : quickViewProduct
    ? [quickViewProduct.image]
    : [];

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (onlyOffers ? 1 : 0) +
    (isPajillasView ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0);

  const hasCategories = categories.length > 0;

  const visibleBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();
    const list = query
      ? availableBrands.filter((brand) => brand.toLowerCase().includes(query))
      : availableBrands;
    // Las marcas con resultados primero: filtrar por una que da cero es un callejon sin salida.
    return [...list].sort((a, b) => (brandCounts[b] || 0) - (brandCounts[a] || 0));
  }, [availableBrands, brandSearch, brandCounts]);

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, 'dots-right', totalPages] as const;
    if (currentPage >= totalPages - 3) {
      return [1, 'dots-left', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
    }
    return [1, 'dots-left', currentPage - 1, currentPage, currentPage + 1, 'dots-right', totalPages] as const;
  }, [currentPage, totalPages]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (selectedCategory) {
      chips.push({
        key: `category-${selectedCategory}`,
        label: `Categoria: ${selectedCategory}`,
        onRemove: () => setSelectedCategory(null),
      });
    }
    if (selectedBrand) {
      chips.push({
        key: `brand-${selectedBrand}`,
        label: `Marca: ${selectedBrand}`,
        onRemove: () => setSelectedBrand(null),
      });
    }
    if (onlyOffers) {
      chips.push({
        key: 'offers',
        label: 'Solo ofertas',
        onRemove: () => setOnlyOffers(false),
      });
    }
    if (isPajillasView) {
      chips.push({
        key: 'pajillas',
        label: 'Vista pajillas',
        onRemove: () => setIsPajillasView(false),
      });
    }
    return chips;
  }, [selectedCategory, selectedBrand, onlyOffers, isPajillasView]);

  const handleAddedToCart = (product: Product) => {
    setToastMessage(`${product.name} agregado al carrito`);
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchTerm('');
    setBrandSearch('');
    setOnlyOffers(false);
    setIsPajillasView(false);
    setSortBy('relevance');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, isPajillasView, onlyOffers, sortBy, deferredSearch]);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const params = new URLSearchParams();
        params.set('paginated', '1');
        params.set('page', String(currentPage));
        params.set('perPage', String(PRODUCTS_PER_PAGE));
        params.set('sortBy', sortBy);
        if (deferredSearch) params.set('search', deferredSearch);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (onlyOffers) params.set('onlyOffers', '1');
        if (isPajillasView) params.set('pajillas', '1');

        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Error API');
        const data = (await response.json()) as ProductsPageResponse;

        setLoadFailed(false);
        setProducts(Array.isArray(data.items) ? data.items : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setAvailableBrands(Array.isArray(data.brands) ? data.brands : []);
        setCategoryPreviews(Array.isArray(data.categoryPreviews) ? data.categoryPreviews : []);
        setCategoryCounts(data.categoryCounts || {});
        setBrandCounts(data.brandCounts || {});
        setCatalogTotal(typeof data.catalogTotal === 'number' ? data.catalogTotal : 0);
        setTotalResults(typeof data.total === 'number' ? data.total : 0);
        setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);

        if (typeof data.page === 'number' && data.page !== currentPage) {
          setCurrentPage(data.page);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        // Distinguir "no hay resultados" de "no pudimos conectar": antes ambos
        // casos mostraban el mismo mensaje culpando a los filtros del usuario.
        setLoadFailed(true);
        setProducts(PRODUCTS);
        setCategories([]);
        setAvailableBrands([]);
        setCategoryPreviews([]);
        setCategoryCounts({});
        setBrandCounts({});
        setCatalogTotal(PRODUCTS.length);
        setTotalResults(PRODUCTS.length);
        setTotalPages(1);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false);
        }
      }
    };

    void loadProducts();
    return () => controller.abort();
  }, [
    currentPage,
    deferredSearch,
    selectedCategory,
    selectedBrand,
    onlyOffers,
    isPajillasView,
    sortBy,
  ]);

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
            Explora nuestro catalogo completo de soluciones de ingenieria ganadera. {catalogTotal} productos disponibles.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="#products">
              <Button className="rounded-full px-5">Explorar productos</Button>
            </Link>
            <Button
              variant="outline"
              className="rounded-full px-5"
              onClick={resetFilters}
            >
              Reiniciar filtros
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
            <div className="rounded-xl border bg-background/80 px-4 py-3">
              <p className="text-xs text-muted-foreground">Productos</p>
              <p className="text-xl font-bold text-foreground">{catalogTotal}</p>
            </div>
            {hasCategories && (
              <div className="rounded-xl border bg-background/80 px-4 py-3">
                <p className="text-xs text-muted-foreground">Categorías</p>
                <p className="text-xl font-bold text-foreground">{categories.length}</p>
              </div>
            )}
            <div className="rounded-xl border bg-background/80 px-4 py-3">
              <p className="text-xs text-muted-foreground">Marcas</p>
              <p className="text-xl font-bold text-foreground">{availableBrands.length}</p>
            </div>
            <div className="rounded-xl border bg-background/80 px-4 py-3">
              <p className="text-xs text-muted-foreground">Resultados</p>
              <p className="text-xl font-bold text-primary">{totalResults}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-background" id="products">
        {showMobileFilters && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
            aria-hidden="true"
          />
        )}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside
            className={`${
              showMobileFilters
                ? 'fixed inset-x-3 top-20 bottom-3 z-50 block overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-2xl'
                : 'hidden'
            } space-y-4 lg:col-span-4 xl:col-span-3 lg:block lg:sticky lg:top-24 lg:self-start lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:overflow-visible`}
          >
            <div className="lg:hidden flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <p className="text-sm font-semibold text-foreground">Filtros y categorias</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Categorias: cada una muestra cuantos productos quedarian al elegirla */}
            {hasCategories && (
              <div className="st-panel">
                <p className="st-panel-title">Categorías</p>
                <div className="st-options">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`st-option ${selectedCategory === null ? 'is-active' : ''}`}
                  >
                    <span>Todas</span>
                    <span className="st-count">{catalogTotal}</span>
                  </button>
                  {categories.map((category) => {
                    const count = categoryCounts[category] ?? 0;
                    return (
                      <button
                        key={category}
                        type="button"
                        disabled={count === 0 && selectedCategory !== category}
                        onClick={() => setSelectedCategory(category)}
                        className={`st-option ${selectedCategory === category ? 'is-active' : ''}`}
                      >
                        <span>{category}</span>
                        <span className="st-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Marcas: ordenadas por cantidad, con buscador cuando son muchas */}
            {availableBrands.length > 0 && (
              <div className="st-panel">
                <div className="flex items-center justify-between gap-2">
                  <p className="st-panel-title">Marcas</p>
                  <span className="text-xs text-muted-foreground">{availableBrands.length}</span>
                </div>

                {availableBrands.length >= BRAND_SEARCH_THRESHOLD && (
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Buscar marca"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:border-primary"
                    />
                  </div>
                )}

                <div className="st-options mt-2 max-h-72 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedBrand(null)}
                    className={`st-option ${selectedBrand === null ? 'is-active' : ''}`}
                  >
                    <span>Todas</span>
                  </button>
                  {visibleBrands.map((brand) => {
                    const count = brandCounts[brand] ?? 0;
                    return (
                      <button
                        key={brand}
                        type="button"
                        disabled={count === 0 && selectedBrand !== brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`st-option ${selectedBrand === brand ? 'is-active' : ''}`}
                      >
                        <span className="truncate">{brand}</span>
                        <span className="st-count">{count}</span>
                      </button>
                    );
                  })}
                  {visibleBrands.length === 0 && (
                    <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                      Ninguna marca coincide con «{brandSearch}»
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="st-panel">
              <p className="st-panel-title">Otros filtros</p>
              <div className="flex flex-wrap gap-2 mt-2">
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
              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={resetFilters} className="w-full justify-center mt-3 text-sm">
                  Limpiar {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'}
                </Button>
              )}
            </div>
          </aside>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <div className="lg:hidden flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters((v) => !v)}
                className="rounded-full"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {showMobileFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </Button>
              <p className="text-sm text-muted-foreground">
                {totalResults} resultados
              </p>
            </div>

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

              {activeFilterChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFilterChips.slice(0, 10).map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={chip.onRemove}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/15"
                    >
                      <span>{chip.label}</span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              )}

              {/* Acceso rapido en movil, donde el panel lateral esta oculto.
                  En escritorio las categorias viven en el panel, con contadores. */}
              {hasCategories && (
                <div className="lg:hidden w-full overflow-x-auto pb-1">
                  <div className="flex flex-nowrap items-center gap-2 min-w-max">
                    <Button
                      variant={selectedCategory === null ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(null)}
                      className="rounded-full h-8 px-3 text-xs shrink-0"
                    >
                      Todos <span className="ml-1.5 opacity-60">{catalogTotal}</span>
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={`quick-${category}`}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category)}
                        className="rounded-full h-8 px-3 text-xs shrink-0"
                      >
                        {category}
                        <span className="ml-1.5 opacity-60">{categoryCounts[category] ?? 0}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

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
                    onClick={resetFilters}
                    className="rounded-full"
                  >
                    Limpiar filtros ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>

            {hasCategories && (
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
                      loading="lazy"
                      quality={60}
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                    <div className="absolute inset-x-0 bottom-0 p-2">
                      <p className="text-white text-xs sm:text-sm font-semibold line-clamp-1">{item.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

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
                {totalResults} productos disponibles
                {totalResults > 0 && (
                  <span>{` · Página ${currentPage} de ${totalPages}`}</span>
                )}
              </p>
              {selectedBrand && (
                <p className="text-sm text-primary mt-1">Filtrando por marca: {selectedBrand}</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Mostrando{' '}
                <span className="font-semibold text-foreground">
                  {totalResults === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1}
                </span>
                {' '}a{' '}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * PRODUCTS_PER_PAGE, totalResults)}
                </span>
                {' '}de{' '}
                <span className="font-semibold text-foreground">{totalResults}</span>
                {' '}resultados
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Pagina {currentPage}/{totalPages}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {isLoadingProducts
                ? // Esqueletos del mismo tamano que las tarjetas: al filtrar, la
                  // rejilla no salta ni se queda en blanco.
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`skeleton-${idx}`} className="st-skeleton-card">
                      <div className="st-skeleton st-skeleton-img" />
                      <div className="p-5 flex flex-col gap-3">
                        <div className="st-skeleton h-4 w-4/5 rounded" />
                        <div className="st-skeleton h-3 w-full rounded" />
                        <div className="st-skeleton h-3 w-2/3 rounded" />
                        <div className="st-skeleton h-9 w-full rounded-full mt-2" />
                      </div>
                    </div>
                  ))
                : products.map((product, idx) => (
                    <div
                      key={product.id}
                      className="st-card-in"
                      style={{ animationDelay: `${Math.min(idx, 8) * 45}ms` }}
                    >
                      <ProductCard
                        product={product}
                        onQuickView={setQuickViewProduct}
                        onAddedToCart={handleAddedToCart}
                      />
                    </div>
                  ))}
            </div>

            {totalResults > PRODUCTS_PER_PAGE && (
              <div className="pt-8">
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-center gap-2 min-w-max px-1">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-full h-8 px-3"
                    >
                      ←
                    </Button>
                    {paginationItems.map((item, idx) =>
                      typeof item === 'number' ? (
                        <Button
                          key={`page-${item}`}
                          variant={currentPage === item ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(item)}
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-md p-0"
                        >
                          {item}
                        </Button>
                      ) : (
                        <span key={`dots-${idx}`} className="px-1 text-muted-foreground">
                          ...
                        </span>
                      )
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-full h-8 px-3"
                    >
                      →
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Fallo de conexion: no es culpa de los filtros, y decirlo evita
                que el usuario se ponga a cambiarlos sin razon. */}
            {!isLoadingProducts && loadFailed && (
              <div className="text-center py-24 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <X className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  No pudimos cargar el catálogo
                </h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Hubo un problema de conexión. No es por tus filtros. Vuelve a intentarlo
                  en unos segundos.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6"
                >
                  Reintentar
                </Button>
              </div>
            )}

            {!isLoadingProducts && !loadFailed && totalResults === 0 && (
              <div className="text-center py-24 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Sin resultados
                </h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {searchTerm.trim()
                    ? <>No encontramos nada para «{searchTerm.trim()}». Prueba con menos palabras o revisa la ortografía.</>
                    : 'Ninguna combinación de filtros da resultados. Quita alguno para ampliar la búsqueda.'}
                </p>
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={resetFilters}
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6"
                  >
                    Limpiar {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'}
                  </Button>
                )}
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
                      loading="lazy"
                      quality={70}
                      sizes="(max-width: 640px) 100vw, 50vw"
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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-50 rounded-lg border border-primary/20 bg-background px-4 py-3 shadow-xl">
          <p className="text-sm font-medium text-foreground">{toastMessage}</p>
        </div>
      )}

      <Footer />
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
