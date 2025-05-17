
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
  country?: string; // Добавляем поле country
  specifications: Record<string, any>;
  _numericPrice?: number;
}

export interface SearchParams {
  query: string;
  page?: number; // Делаем необязательным
  language?: string; // Делаем необязательным
  countries?: string[]; // Делаем необязательным
  filters?: ProductFilters;
  originalQuery?: string;
  requireGermanResults?: boolean;
  minResultCount?: number;
}

export interface ProductFilters {
  priceRange?: [number | null, number | null];
  brands?: string[];
  countries?: string[]; // Добавляем поддержку стран
  sources?: string[]; // Добавляем поддержку источников
  minPrice?: number; // Добавляем минимальную цену
  maxPrice?: number; // Добавляем максимальную цену
  rating?: number; // Добавляем рейтинг
  sortOption?: SortOption;
  sortBy?: string; // Добавляем sortBy для обратной совместимости
}

// Обновляем тип SortOption, чтобы включить варианты сортировки используемые в коде
export type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'rating-asc' | 'price_asc' | 'price_desc' | 'rating_desc' | null;

// Добавляем интерфейс ApiResponse для совместимости
export interface ApiResponse {
  products: Product[];
  totalPages: number;
  isDemo: string; // Строковое представление для совместимости
  apiInfo?: Record<string, string>;
}

export interface ApiInfo {
  source: string;
  query: string;
  totalResults: string;
}

// Добавляем интерфейс для предложений брендов
export interface BrandSuggestion {
  id: string;
  name: string;
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

// Добавляем тип SearchResult для совместимости
export interface SearchResult {
  products: Product[];
  totalPages: number;
  isDemo?: boolean | string;
  apiInfo?: Record<string, string>;
}
