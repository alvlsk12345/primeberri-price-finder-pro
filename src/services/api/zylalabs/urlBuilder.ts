
import { SearchParams } from "../../types";

/**
 * Строит URL для запроса к Zylalabs API
 * @param params Параметры поиска
 * @returns URL для запроса
 */
export const buildUrl = (params: SearchParams): string => {
  // Базовый URL для API поиска товаров
  const baseUrl = "https://api.zylalabs.com/api/2033/real-time-product-search-api/1809/search-products";
  
  // Создаем экземпляр URLSearchParams для построения параметров запроса
  const urlParams = new URLSearchParams();
  
  // Добавляем обязательный параметр запроса
  urlParams.append('query', params.query);
  
  // Добавляем опциональные параметры, если они есть
  if (params.page) {
    urlParams.append('page', params.page.toString());
  }
  
  if (params.countries && params.countries.length > 0) {
    urlParams.append('countries', params.countries.join(','));
  }
  
  if (params.language) {
    urlParams.append('language', params.language);
  }
  
  // Собираем полный URL запроса
  return `${baseUrl}?${urlParams.toString()}`;
};
