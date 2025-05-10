
import { SearchParams } from "../../types";
import { BASE_URL } from "./config";

/**
 * Формирование URL с параметрами для Zylalabs API
 * @param params Параметры поиска
 * @returns Сформированный URL для API запроса
 */
export const buildZylalabsUrl = (params: SearchParams): string => {
  // Формирование базового URL с основными параметрами
  const query = encodeURIComponent(params.query);
  
  // Используем 'q' вместо 'query' в соответствии с API
  let url = `${BASE_URL}?q=${query}&language=en`;
  
  // Добавляем номер страницы, если указан
  if (params.page && params.page > 1) {
    url += `&page=${params.page}`;
  }
  
  // Добавляем фильтры, если они указаны
  if (params.filters) {
    // Сортировка
    if (params.filters.sortBy) {
      url += `&sortBy=${params.filters.sortBy}`;
    }
    
    // Минимальная цена
    if (params.filters.minPrice) {
      url += `&minPrice=${params.filters.minPrice}`;
    }
    
    // Максимальная цена
    if (params.filters.maxPrice) {
      url += `&maxPrice=${params.filters.maxPrice}`;
    }
    
    // Минимальный рейтинг
    if (params.filters.rating) {
      url += `&minRating=${params.filters.rating}`;
    }
    
    // Бренды (если указаны)
    if (params.filters.brands && params.filters.brands.length > 0) {
      const brands = params.filters.brands.join(',');
      url += `&brand=${encodeURIComponent(brands)}`;
    }
  }
  
  // Добавляем страны поиска, если указаны
  if (params.countries && params.countries.length > 0) {
    url += `&country=${params.countries.join(',')}`;
  }
  
  return url;
};
