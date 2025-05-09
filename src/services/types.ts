
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
};

// Тип для карты доменов магазинов
export type StoreMap = {
  [key: string]: string;
};

// Тип для параметров поиска с пагинацией
export type SearchParams = {
  query: string;
  page: number;
  language?: string;  // Язык результатов поиска (en, de, fr, и т.д.)
  countries?: string[]; // Массив кодов стран для поиска
  filters?: ProductFilters;
};

// Тип для фильтров товаров
export type ProductFilters = {
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  sources?: string[];
  countries?: string[]; // Добавлен фильтр по странам
  rating?: number;
};
