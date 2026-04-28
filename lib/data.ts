export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand?: string;
  images: string[];
  image: string;
  model3dEmbedUrl?: string;
  specifications: string[];
  youtubeId: string;
  inStock: boolean;
  stockQuantity?: number;
  inOffer?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  url?: string;
}

export interface HeroSlide {
  id: string;
  url: string;
  badge: string;
  title: string;
  description: string;
}

export interface CategoryPreview {
  category: string;
  image: string;
}

export interface ProductsPageResponse {
  items: Product[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
  catalogTotal: number;
  categories: string[];
  brands: string[];
  categoryPreviews: CategoryPreview[];
}

export const PRODUCTS: Product[] = [];

export const DEFAULT_BRANDS: Brand[] = [
  { id: '1', name: 'Lister', logo: 'https://static1.squarespace.com/static/5e8c3085abdf3f0f0c45b6dc/t/639093e981ece801a7d9c4c6/1775725499595/' },
  { id: '2', name: 'CRV', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJeb9hGt6c4-BhPAl6p34PivNItvfAQ2NP4g&s' },
  { id: '3', name: 'Melasty', logo: 'https://pbs.twimg.com/profile_images/1354803880580706310/k9_Ijr_K_400x400.jpg' },
];

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    url: '/1.png',
    badge: 'Rockink IMM',
    title: 'Innovacion que impulsa tu ganaderia',
    description: 'Tecnologia inteligente para el campo moderno.',
  },
  {
    id: 'hero-2',
    url: '/2.png',
    badge: 'Ganaderia de precision',
    title: 'Resultados reales',
    description: 'Transformamos datos en productividad ganadera.',
  },
  {
    id: 'hero-3',
    url: '/3.png',
    badge: 'Del campo a la nube',
    title: 'Control total desde cualquier lugar',
    description: 'Datos, control y productividad en una sola plataforma.',
  },
];

export const PHONE_NUMBERS = {
  tier1: '+51 962838329',
  tier2: '+51 962838329',
  tier3: '+51 962838329',
};
