
// Определение типов для сервисов
export type Product = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  currency: string;
  image: string;
  link: string;
  rating: number;
  source: string;
  description?: string;         // Описание товара
  availability?: string;        // Доступность товара
  brand?: string;               // Бренд товара
  specifications?: {[key: string]: string}; // Спецификации товара
  _numericPrice?: number;       // Внутреннее поле для фильтрации
  country?: string;             // Страна магазина
};

// Тип для карты доменов магазинов
export type StoreMap = {
  [key: string]: string;
};

// Тип для параметров поиска с пагинацией
export type SearchParams = {
  query: string;
  originalQuery?: string;       // Добавлено поле для оригинального запроса на русском
  page: number;
  language?: string;  // Язык результатов поиска (en, de, fr, и т.д.)
  countries?: string[]; // Массив кодов стран для поиска
  filters?: ProductFilters;
  requireGermanResults?: boolean; // Требовать результаты из немецких магазинов
  minResultCount?: number; // Минимальное количество результатов
};

// Тип для сортировки товаров - добавляем "relevance"
export type SortOption = "price_asc" | "price_desc" | "rating_desc" | "relevance" | "";

// Тип для фильтров товаров
export type ProductFilters = {
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  sources?: string[];
  countries?: string[]; // Добавлен фильтр по странам
  rating?: number;
  sortBy?: SortOption; // Добавлена опция сортировки
};

// Обновленный интерфейс BrandSuggestion
export interface BrandSuggestion {
  name?: string;       // Название бренда (необязательное)
  logo?: string;       // URL логотипа бренда
  description?: string; // Описание бренда
  products?: string[]; // Массив товаров бренда
  // Основные поля для текущего формата ответа
  brand?: string;      // Название бренда
  product?: string;    // Название товара
  imageUrl?: string;   // URL изображения
}

// Добавляем интерфейс для ответа от OpenAI
export interface BrandResponse {
  products?: BrandSuggestion[];
}
