
import { SearchParams, Product } from "../../types";

// Добавляем экспорт parseResponse для обратной совместимости
export const parseResponse = (data: any, originalQuery: string) => {
  // Здесь должна быть ваша логика парсинга
  // Проверяем есть ли данные и структура соответствует ожидаемой
  if (!data || !data.data || !Array.isArray(data.data.products)) {
    console.error('Некорректная структура ответа API:', data);
    return {
      products: [],
      totalPages: 0,
      isDemo: false,
      apiInfo: {
        error: 'Некорректная структура ответа API',
        source: 'API Error'
      }
    };
  }
  
  // Преобразуем товары в нужный формат
  const products = data.data.products.map((item: any) => ({
    id: item.id || `product-${Math.random().toString(36).substring(7)}`,
    title: item.title || 'Unknown Product',
    price: parseFloat(item.price) || 0,
    currency: item.currency || 'EUR',
    image: item.image || '',
    description: item.description || '',
    rating: item.rating || 0,
    url: item.url || '',
    source: item.source || 'Unknown',
    country: item.country || 'de',
    originalData: item
  }));
  
  return {
    products,
    totalPages: data.data.totalPages || 1,
    isDemo: false,
    apiInfo: {
      source: 'Zylalabs API',
      query: originalQuery,
      totalResults: data.data.total?.toString() || '0'
    }
  };
};

// При необходимости можете добавить свою реализацию parseApiResponse
export const parseApiResponse = (data: any, originalQuery: string | SearchParams) => {
  const query = typeof originalQuery === 'string' ? originalQuery : originalQuery.query;
  
  // Аналогичная логика
  return parseResponse(data, query);
};
