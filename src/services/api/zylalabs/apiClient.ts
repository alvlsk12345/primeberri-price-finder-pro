
import { SearchParams } from "@/services/types";
import { buildUrl } from "./urlBuilder";
import { parseResponse } from "./responseParser";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { REQUEST_TIMEOUT } from "./config";
import { useDemoModeForced } from '../mock/mockServiceConfig';

/**
 * Выполняет API-запрос к Zylalabs с указанными параметрами
 * @param params Параметры поискового запроса
 * @returns Результат поиска товаров
 */
export const makeZylalabsApiRequest = async (params: SearchParams): Promise<any> => {
  // Проверка на принудительное использование демо-режима
  // Исправлено: получаем значение напрямую, а не через вызов функции
  const demoModeEnabled = useDemoModeForced;
  if (demoModeEnabled) {
    console.log('Принудительное использование демо-режима. Запрос API пропущен.');
    return generateMockSearchResults(params.query, params.page);
  }

  // Строим URL для запроса
  const url = buildUrl(params);
  
  try {
    // Устанавливаем таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    // Очищаем таймаут после получения ответа
    clearTimeout(timeoutId);
    
    // Обрабатываем ошибки HTTP
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    // Парсим JSON ответ
    const data = await response.json();
    
    // Обрабатываем полученные данные
    return parseResponse(data, params.query);
  } catch (error) {
    console.error('Ошибка при выполнении запроса к Zylalabs API:', error);
    throw error;
  }
};

/**
 * Выполняет API-запрос к Zylalabs для конкретной страны
 * @param query Поисковый запрос
 * @param countryCode Код страны
 * @param page Номер страницы
 * @param language Язык запроса
 * @returns Результат поиска товаров
 */
export const makeZylalabsCountryRequest = async (
  query: string, 
  countryCode: string, 
  page: number = 1, 
  language: string = 'ru'
): Promise<any> => {
  return makeZylalabsApiRequest({
    query,
    page,
    countries: [countryCode],
    language
  });
};
