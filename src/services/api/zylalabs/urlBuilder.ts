
import { SearchParams } from "../../types";
import { BASE_URL } from "./config";

/**
 * Формирование URL с параметрами для Zylalabs API, аналогично HTML-примеру
 * @param params Параметры поиска
 * @returns Сформированный URL для API запроса
 */
export const buildUrl = (params: SearchParams): string => {
  // Формирование параметров запроса аналогично HTML-примеру
  const query = encodeURIComponent(params.query);
  
  // Создаем URLSearchParams как в HTML-примере
  const urlParams = new URLSearchParams({
    q: params.query, // Используем 'q' вместо 'query'
  });
  
  // Добавляем страницу
  if (params.page && params.page > 1) {
    urlParams.append('page', params.page.toString());
  }
  
  // Добавляем страну (только одну, как в HTML-примере)
  // В HTML-примере страны добавляются по одной в разных запросах
  if (params.countries && params.countries.length > 0) {
    urlParams.append('country', params.countries[0]);
  } else {
    // По умолчанию используем Германию
    urlParams.append('country', 'de');
  }
  
  // Добавляем язык (теперь по умолчанию русский)
  if (params.language) {
    urlParams.append('language', params.language);
  } else {
    urlParams.append('language', 'ru'); // По умолчанию используем русский язык
  }
  
  // Создаем итоговый URL
  return `${BASE_URL}?${urlParams.toString()}`;
};

// Alias для совместимости с старым кодом
export const buildZylalabsUrl = buildUrl;
