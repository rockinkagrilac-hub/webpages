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

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Arete Visual Ganadero',
    description: 'identificación visual de alta duracion para manejo de ganado.',
    category: 'identificación Animal',
    image: 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=900&h=900&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&h=900&fit=crop',
    ],
    specifications: ['Material: TPU flexible', 'Alta resistencia UV', 'Uso: bovinos y ovinos'],
    youtubeId: 'dQw4w9WgXcQ',
    inStock: true,
    inOffer: false,
  },
  {
    id: '2',
    name: 'Equipo de Ordeño Portatil',
    description: 'Unidad compacta para operaciones de Ordeño eficientes en campo.',
    category: 'OrdeÃ±o',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&h=900&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&h=900&fit=crop',
    ],
    specifications: ['Bomba de vacio estable', 'Facil limpieza', 'Operacion continua'],
    youtubeId: 'dQw4w9WgXcQ',
    inStock: true,
    inOffer: false,
  },
  {
    id: '3',
    name: 'Termo Criogenico para IA',
    description: 'Conservacion segura de material genetico para inseminacion artificial.',
    category: 'Criogenia',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&h=900&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=900&h=900&fit=crop',
    ],
    specifications: ['Baja evaporacion', 'Proteccion termica', 'Manejo tecnico'],
    youtubeId: 'dQw4w9WgXcQ',
    inStock: true,
    inOffer: false,
  },
  {
    id: '4',
    name: 'Pezonera de Silicona Premium',
    description: 'Repuesto para sistemas de Ordeño con mejor higiene y sellado.',
    category: 'Repuestos',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&h=900&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&h=900&fit=crop',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=900&h=900&fit=crop',
    ],
    specifications: ['Silicona grado alimentario', 'Mayor duracion', 'Mejor confort animal'],
    youtubeId: 'dQw4w9WgXcQ',
    inStock: true,
    inOffer: false,
  },
];

export const DEFAULT_BRANDS: Brand[] = [
  { id: '1', name: 'Lister', logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=140&fit=crop' },
  { id: '2', name: 'CRV', logo: 'https://images.unsplash.com/photo-1560264357-8d9766985b90?w=300&h=140&fit=crop' },
  { id: '3', name: 'Melasty', logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=140&fit=crop' },
  { id: '4', name: 'Sunway', logo: 'https://images.unsplash.com/photo-1560264357-8d9766985b90?w=300&h=140&fit=crop' },
];

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1600&h=900&fit=crop',
    badge: 'Ingenieria Ganadera 4.0',
    title: 'Precision Operativa en Campo',
    description: 'Equipos, repuestos e insumos tecnicos para elevar rendimiento y continuidad operativa.',
  },
  {
    id: 'hero-2',
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&h=900&fit=crop',
    badge: 'Calidad que Responde',
    title: 'Tecnología para Produccion Animal',
    description: 'Soluciones robustas para identificación, reproducción, Ordeño y manejo ganadero.',
  },
  {
    id: 'hero-3',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&h=900&fit=crop',
    badge: 'Soporte Especializado',
    title: 'AcompaÃ±amiento Tecnico Comercial',
    description: 'Te ayudamos a elegir la configuracion correcta segun operacion y tipo de hato.',
  },
];

export const PHONE_NUMBERS = {
  tier1: '+51 962838329',
  tier2: '+51 962838329',
  tier3: '+51 962838329',
};
