'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PRODUCTS, Product, Brand, DEFAULT_BRANDS } from '@/lib/data';
import { Edit2, Trash2, Plus, Check, Award } from 'lucide-react';
import Image from 'next/image';
import { ImageUploader } from '@/components/image-uploader';

const MAX_PRODUCT_IMAGES = 10;
const LOW_STOCK_THRESHOLD = 5;

function AdminDashboardContent() {
  const { isLoggedIn, isMounted } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [redirected, setRedirected] = useState(false);
  const [activeTab, setActiveTab] = useState<'productos' | 'ofertas' | 'marcas'>('productos');
  const [selectedOffersProducts, setSelectedOffersProducts] = useState<string[]>([]);
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('');
  const [newBrandUrl, setNewBrandUrl] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);

  const getApiErrorMessage = async (response: Response, fallback: string) => {
    try {
      const data = (await response.json()) as { message?: string };
      return data?.message || fallback;
    } catch {
      return fallback;
    }
  };

  const loadProductsFromApi = async () => {
    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      if (!response.ok) throw new Error('Error API');
      const data = (await response.json()) as Product[];
      setProducts(data);
    } catch {
      setProducts(PRODUCTS);
    }
  };

  const loadSiteConfigFromApi = async () => {
    try {
      const response = await fetch('/api/site-config', { cache: 'no-store' });
      if (!response.ok) throw new Error('Error API');
      const data = (await response.json()) as {
        offersProducts?: string[];
        brands?: Brand[];
      };

      setSelectedOffersProducts(Array.isArray(data.offersProducts) ? data.offersProducts : []);
      setBrands(Array.isArray(data.brands) && data.brands.length > 0 ? data.brands : DEFAULT_BRANDS);
    } catch {
      setSelectedOffersProducts([]);
      setBrands(DEFAULT_BRANDS);
    }
  };

  const saveSiteConfig = async (patch: {
    offersProducts?: string[];
    brands?: Brand[];
  }) => {
    const response = await fetch('/api/site-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      alert('No se pudo guardar la configuración');
      return false;
    }
    const data = (await response.json()) as {
      offersProducts: string[];
      brands: Brand[];
    };
    setSelectedOffersProducts(data.offersProducts);
    setBrands(data.brands);
    return true;
  };

  useEffect(() => {
    if (isMounted && !isLoggedIn && !redirected) {
      setRedirected(true);
      router.push('/admin/login');
    }
  }, [isMounted, isLoggedIn, redirected, router]);

  useEffect(() => {
    if (!isMounted || !isLoggedIn) return;

    void loadProductsFromApi();
    void loadSiteConfigFromApi();
  }, [isMounted, isLoggedIn]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const fallbackImage =
      formData.image ||
      'https://images.unsplash.com/photo-1574895617837-7e16022e5ecb?w=500&h=500&fit=crop';
    const selectedImages =
      productImages.length > 0 ? productImages.slice(0, MAX_PRODUCT_IMAGES) : [fallbackImage];
    const mainImage = selectedImages[0];

    const stockQuantity =
      typeof formData.stockQuantity === 'number'
        ? Math.max(0, Math.floor(formData.stockQuantity))
        : Number(formData.stockQuantity ?? 0) > 0
        ? Math.max(0, Math.floor(Number(formData.stockQuantity)))
        : 0;

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name || '',
      description: formData.description || '',
      category: formData.category || 'Otros',
      brand: (formData as Product & { brand?: string }).brand || '',
      image: mainImage,
      model3dEmbedUrl: formData.model3dEmbedUrl || undefined,
      images: selectedImages,
      specifications: formData.specifications || [],
      youtubeId: formData.youtubeId || 'dQw4w9WgXcQ',
      stockQuantity,
      inStock: stockQuantity > 0,
      inOffer: formData.inOffer || false,
    };

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });
    if (!response.ok) {
      alert(await getApiErrorMessage(response, 'No se pudo crear el producto'));
      return;
    }
    await loadProductsFromApi();
    setFormData({});
    setProductImages([]);
    setShowAddForm(false);
    alert('Producto añadido exitosamente');
  };

  const handleUpdateProduct = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    const current = products.find((p) => p.id === id);
    if (!current) return;
    const existingImages =
      current.images && current.images.length > 0
        ? current.images.slice(0, MAX_PRODUCT_IMAGES)
        : [current.image];
    const selectedImages =
      productImages.length > 0
        ? productImages.slice(0, MAX_PRODUCT_IMAGES)
        : formData.image
        ? [formData.image]
        : existingImages;
    const mainImage = selectedImages[0] || current.image;
    const nextStockQuantity =
      typeof formData.stockQuantity === 'number'
        ? Math.max(0, Math.floor(formData.stockQuantity))
        : formData.stockQuantity !== undefined
        ? Math.max(0, Math.floor(Number(formData.stockQuantity) || 0))
        : typeof current.stockQuantity === 'number'
        ? current.stockQuantity
        : current.inStock
        ? 1
        : 0;

    const payload: Product = {
      ...current,
      ...formData,
      image: mainImage,
      images: selectedImages,
      stockQuantity: nextStockQuantity,
      inStock: nextStockQuantity > 0,
    };
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      alert(await getApiErrorMessage(response, 'No se pudo actualizar el producto'));
      return;
    }
    await loadProductsFromApi();
    setEditingId(null);
    setFormData({});
    setProductImages([]);
    alert('Producto actualizado exitosamente');
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        alert(await getApiErrorMessage(response, 'No se pudo eliminar el producto'));
        return;
      }
      await loadProductsFromApi();
    }
  };

  const handleToggleOfferProduct = async (productId: string) => {
    let updated: string[];
    if (selectedOffersProducts.includes(productId)) {
      updated = selectedOffersProducts.filter((id) => id !== productId);
    } else {
      updated = [...selectedOffersProducts, productId];
    }
    await saveSiteConfig({ offersProducts: updated });
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim() || !newBrandLogo.trim()) {
      alert('Por favor completa el nombre y logo de la marca');
      return;
    }

    const newBrand: Brand = {
      id: Date.now().toString(),
      name: newBrandName,
      logo: newBrandLogo,
      url: newBrandUrl.trim() ? newBrandUrl.trim() : undefined,
    };

    const updatedBrands = [...brands, newBrand];
    const ok = await saveSiteConfig({ brands: updatedBrands });
    if (!ok) return;
    setNewBrandName('');
    setNewBrandLogo('');
    setNewBrandUrl('');
    alert('Marca agregada exitosamente');
  };

  const handleDeleteBrand = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta marca?')) {
      const updatedBrands = brands.filter((b) => b.id !== id);
      await saveSiteConfig({ brands: updatedBrands });
    }
  };

  if (!isMounted || !isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header isAdmin={true} />

      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <Button
            variant={activeTab === 'productos' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('productos')}
            className="rounded-b-none"
          >
            Productos
          </Button>
          <Button
            variant={activeTab === 'ofertas' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('ofertas')}
            className="rounded-b-none"
          >
            <Check className="w-4 h-4 mr-2" />
            Gestionar Ofertas
          </Button>
          <Button
            variant={activeTab === 'marcas' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('marcas')}
            className="rounded-b-none"
          >
            <Award className="w-4 h-4 mr-2" />
            Marcas
          </Button>
        </div>

        {/* Tab: Productos */}
        {activeTab === 'productos' && (
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary">Gestión de Productos</h1>
            <Button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                setFormData({});
                setProductImages([]);
              }}
              className="bg-secondary hover:bg-secondary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showAddForm ? 'Cancelar' : 'Nuevo Producto'}
            </Button>
          </div>
        )}

        {/* Add/Edit Form */}
        {activeTab === 'productos' && (showAddForm || editingId) && (
          <Card className="mb-8 border-2 border-accent">
            <CardContent className="pt-6">
              <form
                onSubmit={(e) =>
                  editingId ? handleUpdateProduct(editingId, e) : handleAddProduct(e)
                }
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nombre</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded"
                      placeholder="Nombre del producto"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Categoría</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded"
                      placeholder="Escribe la categoría"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Marca</label>
                    <input
                      type="text"
                      value={(formData as Product & { brand?: string }).brand || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value } as Partial<Product>)
                      }
                      className="w-full px-3 py-2 border border-input rounded"
                      placeholder="Escribe la marca"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Descripción</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded"
                      placeholder="Descripción del producto"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <ImageUploader
                      images={productImages}
                      onImagesChange={setProductImages}
                      maxImages={MAX_PRODUCT_IMAGES}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Stock actual</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.stockQuantity ?? 0}
                      onChange={(e) =>
                        setFormData({ ...formData, stockQuantity: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="w-full px-3 py-2 border border-input rounded"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">ID de Video YouTube</label>
                    <input
                      type="text"
                      value={formData.youtubeId || ''}
                      onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded"
                      placeholder="dQw4w9WgXcQ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">URL embebible 3D (opcional)</label>
                    <input
                      type="text"
                      value={formData.model3dEmbedUrl || ''}
                      onChange={(e) => setFormData({ ...formData, model3dEmbedUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded"
                      placeholder="https://sketchfab.com/models/.../embed"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.stockQuantity ?? (formData.inStock !== false ? 1 : 0)) > 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            inStock: e.target.checked,
                            stockQuantity: e.target.checked
                              ? Math.max(1, Number(formData.stockQuantity ?? 1))
                              : 0,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-semibold">En Stock</span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inOffer || false}
                        onChange={(e) => setFormData({ ...formData, inOffer: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-semibold">En Oferta</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingId ? 'Actualizar Producto' : 'Crear Producto'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setFormData({});
                      setProductImages([]);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        {activeTab === 'productos' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              Total de productos: {products.length}
            </h2>

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-start">
                      <div className="relative w-24 h-24 bg-muted rounded flex-shrink-0">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-lg font-bold text-primary">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                        <p className="text-sm text-foreground line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <div className="flex gap-2">
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                            Stock: {product.stockQuantity ?? (product.inStock ? 1 : 0)}
                          </span>
                          {(product.stockQuantity ?? (product.inStock ? 1 : 0)) <= LOW_STOCK_THRESHOLD && (
                            <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">
                              Stock bajo
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            product.inStock
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.inStock ? 'En Stock' : 'Agotado'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(product.id);
                            setFormData(product);
                            setProductImages(
                              product.images && product.images.length > 0
                                ? product.images.slice(0, MAX_PRODUCT_IMAGES)
                                : [product.image]
                            );
                            setShowAddForm(false);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}


        {/* Tab: Gestionar Ofertas */}
        {activeTab === 'ofertas' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Gestión de Productos en Oferta</h1>
            <p className="text-muted-foreground">
              Selecciona los productos que deseas mostrar en la sección de ofertas. Estos aparecerán en el carrusel principal.
            </p>

            <div className="grid gap-3">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay productos disponibles</p>
                </div>
              ) : (
                products.map((product) => (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all ${
                      selectedOffersProducts.includes(product.id)
                        ? 'border-primary border-2 bg-primary/5'
                        : 'border-border hover:border-primary'
                    }`}
                    onClick={() => handleToggleOfferProduct(product.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="relative w-20 h-20 bg-muted rounded flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      <div className="flex-grow">
                        <h3 className="font-bold text-foreground">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.inStock ? 'âœ“ En Stock' : 'âœ— Agotado'}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          selectedOffersProducts.includes(product.id)
                            ? 'bg-primary border-primary'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedOffersProducts.includes(product.id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold">
                Productos seleccionados: {selectedOffersProducts.length}
              </p>
            </div>
          </div>
        )}

        {/* Tab: Marcas */}
        {activeTab === 'marcas' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Gestión de Marcas</h1>

            {/* Add Brand Form */}
            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nombre de la Marca</label>
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded"
                      placeholder="Ej: Lister"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">URL del Logo</label>
                    <input
                      type="text"
                      value={newBrandLogo}
                      onChange={(e) => setNewBrandLogo(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Link de la Marca (opcional)</label>
                    <input
                      type="text"
                      value={newBrandUrl}
                      onChange={(e) => setNewBrandUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded"
                      placeholder="https://www.marca.com"
                    />
                  </div>
                  <Button onClick={handleAddBrand} className="w-full bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Marca
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Brands List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">Total de marcas: {brands.length}</h2>
              <div className="grid gap-4">
                {brands.map((brand) => (
                  <Card key={brand.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="relative w-24 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                        <img
                          src={brand.logo || '/placeholder.svg'}
                          alt={brand.name}
                          className="h-full w-full object-contain rounded p-2"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold text-foreground">{brand.name}</h3>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBrand(brand.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}

export default function AdminPage() {
  return <AdminDashboardContent />;
}







