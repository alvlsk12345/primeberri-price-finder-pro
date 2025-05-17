export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  currency: string;
  image: string;
  link: string;
  rating: number;
  source: string;
  description: string;
  availability: string;
  brand: string;
  country?: string;
  specifications: Record<string, any>;
  _numericPrice?: number; // Добавляем поле для хранения числового значения цены
}

export interface SearchParams {
  query: string;
  page?: number;
  language?: string;
  countries?: string[];
  filters?: ProductFilters;
  originalQuery?: string;
  requireGermanResults?: boolean;
  minResultCount?: number;
  limit?: number; // Добавляем опциональное свойство limit
}

export interface ProductFilters {
  priceRange?: [number | null, number | null];
  brands?: string[];
  countries?: string[];
  sources?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortOption?: SortOption;
  sortBy?: string;
}

// Обновляем тип SortOption, чтобы включить варианты сортировки используемые в коде
export type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'rating-asc' | 'price_asc' | 'price_desc' | 'rating_desc' | null;

export interface ApiResponse {
  products: Product[];
  totalPages: number;
  isDemo: boolean | string;
  apiInfo?: Record<string, string>;
}

export interface ApiInfo {
  source: string;
  query: string;
  totalResults: string;
}

// Обновляем интерфейс BrandSuggestion, чтобы он соответствовал используемому в коде
export interface BrandSuggestion {
  id?: string;
  name?: string;
  brand?: string;
  product?: string;
  description: string;
  logoUrl?: string;
  category?: string;
  confidence?: number;
  price?: {
    min?: number;
    max?: number;
    avg?: number;
  };
}

export interface SearchResult {
  products: Product[];
  totalPages: number;
  isDemo?: boolean | string;
  apiInfo?: Record<string, string>;
}

// Добавляем интерфейс StoreMap, используемый в urlService.ts
export interface StoreMap {
  [key: string]: string;
}
