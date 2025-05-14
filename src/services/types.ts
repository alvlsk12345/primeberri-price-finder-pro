
// Дополним файл типов необходимыми интерфейсами для Product, ProductFilters, SearchParams и т.д.

// Интерфейс товара
export interface Product {
  id?: string;
  title: string;
  description?: string;
  price: string;
  currency?: string;
  brand?: string;
  source: string;
  country?: string;
  link?: string;
  image?: string;
  rating?: number;
  fullDescription?: string;
  specifications?: Record<string, string>;
  _numericPrice?: number;
  _sourceData?: any;
  
  // Добавляем отсутствующие свойства, которые используются в коде
  availability?: string;
  subtitle?: string;
}

// Карта магазинов для сервиса URL
export interface StoreMap {
  [storeName: string]: string;
}

// Интерфейс для фильтров товаров
export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  countries?: string[];
  sources?: string[];
  rating?: number;
  sortBy?: SortOption;
  [key: string]: any; // Для дополнительных фильтров
}

// Параметры поиска для API
export interface SearchParams {
  query: string;
  originalQuery?: string;
  page?: number;
  language?: string;
  countries?: string[];
  filters?: ProductFilters;
  requireGermanResults?: boolean;
  minResultCount?: number;
}

// Типы сортировки
export type SortOption = 'price_asc' | 'price_desc' | 'rating_desc' | 'relevance';

// Интерфейс для предложения брендов
export interface BrandSuggestion {
  brand: string;
  product: string;
  description: string;
}

// Интерфейс для результатов поиска
export interface SearchResult {
  products: Product[];
  totalPages?: number;
  isDemo?: boolean;
  apiInfo?: Record<string, string>;
}

// Интерфейс для ответа от API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  meta?: {
    page?: number;
    totalPages?: number;
    totalResults?: number;
  };
}
