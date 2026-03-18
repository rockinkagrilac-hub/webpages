export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
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
}

export interface HeroSlide {
  id: string;
  url: string;
  badge: string;
  title: string;
  description: string;
}

export const PRODUCTS: Product[] = [];

export const DEFAULT_BRANDS: Brand[] = [
  { id: '1', name: 'Lister', logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=140&fit=crop' },
  { id: '2', name: 'CRV', logo: 'https://images.unsplash.com/photo-1560264357-8d9766985b90?w=300&h=140&fit=crop' },
  { id: '3', name: 'Melasty', logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=140&fit=crop' },
  { id: '4', name: 'Sunway', logo: 'https://images.unsplash.com/photo-1560264357-8d9766985b90?w=300&h=140&fit=crop' },
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
