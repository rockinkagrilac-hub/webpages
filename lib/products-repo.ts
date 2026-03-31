import { Product } from '@/lib/data';
import { supabase } from '@/lib/supabase';

type ProductRow = {
  id: string;
  descripcion: string;
  categoria: string;
  marca: string;
  imagen_1: string;
  imagen_2: string | null;
  imagen_3: string | null;
};

const DEFAULT_YOUTUBE = 'dQw4w9WgXcQ';

function mapRowToProduct(row: ProductRow): Product {
  const images = [row.imagen_1, row.imagen_2 || '', row.imagen_3 || ''].filter(Boolean);
  return {
    id: row.id,
    name: row.descripcion,
    description: row.descripcion,
    category: row.categoria,
    brand: row.marca,
    image: row.imagen_1,
    images,
    model3dEmbedUrl: undefined,
    specifications: [],
    youtubeId: DEFAULT_YOUTUBE,
    inStock: false,
    stockQuantity: 0,
    inOffer: false,
  };
}

function mapProductToRow(input: Product | Partial<Product>): Omit<ProductRow, 'id'> {
  const images = input.images && input.images.length > 0 ? input.images : input.image ? [input.image] : [];
  return {
    descripcion: input.description || input.name || '',
    categoria: input.category || '',
    marca: input.brand || input.category || '',
    imagen_1: images[0] || '',
    imagen_2: images[1] || null,
    imagen_3: images[2] || null,
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('descripcion', { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => mapRowToProduct(row as ProductRow));
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data ? mapRowToProduct(data as ProductRow) : null;
}

export async function createProduct(input: Product): Promise<Product> {
  const payload = mapProductToRow(input);
  const { data, error } = await supabase.from('products').insert(payload).select('*').single();
  if (error) throw error;
  return mapRowToProduct(data as ProductRow);
}

export async function updateProduct(id: string, input: Partial<Product>): Promise<Product | null> {
  const payload = mapProductToRow(input);
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('*').single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data ? mapRowToProduct(data as ProductRow) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
}
