
import { SearchParams } from "../../types";
import { BASE_URL } from "./config"; 

/**
 * Строит URL для запроса к Zylalabs API
 * @param params Параметры поиска
 * @returns URL для запроса
 */
export const buildUrl = (params: SearchParams): string => {
  // Создаем экземпляр URLSearchParams для построения параметров запроса
  const urlParams = new URLSearchParams();
  
  // Добавляем обязательный параметр запроса 'q' вместо 'query' согласно документации
  urlParams.append('q', params.query);
  
  // Добавляем опциональные параметры, если они есть
  if (params.page) {
    urlParams.append('page', params.page.toString());
  }
  
  if (params.countries && params.countries.length > 0) {
    urlParams.append('country', params.countries[0]); // Используем только первую страну как параметр country
  }
  
  if (params.language) {
    urlParams.append('language', params.language);
  }
  
  // Собираем полный URL запроса с использованием BASE_URL из config.ts
  return `${BASE_URL}?${urlParams.toString()}`;
};

/**
 * Формирует URL для запроса конкретной страницы результатов
 * @param searchParams Параметры поиска
 * @returns Полный URL для запроса
 */
export const calculatePageUrl = (searchParams: SearchParams): string => {
  return buildUrl(searchParams);
};
