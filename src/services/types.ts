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
  specifications: Record<string, any>;
  _numericPrice?: number;
}

export interface SearchParams {
  query: string;
  page: number;
  language: string;
  countries: string[];
  filters?: ProductFilters;
  originalQuery?: string;
  requireGermanResults?: boolean;
  minResultCount?: number;
}

export interface ProductFilters {
  priceRange?: [number | null, number | null];
  brands?: string[];
  sortOption?: SortOption;
}

export type SortOption = 'price-asc' | 'price-desc' | 'rating-asc' | 'rating-desc' | null;

// Расширяем интерфейс ApiResponse для включения isDemo строкового типа в apiInfo
export interface ApiResponse {
  products: Product[];
  totalPages: number;
  isDemo: string; // Изменено с boolean на string для совместимости
  apiInfo?: Record<string, string>;
}

export interface ApiInfo {
  source: string;
  query: string;
  totalResults: string;
}
