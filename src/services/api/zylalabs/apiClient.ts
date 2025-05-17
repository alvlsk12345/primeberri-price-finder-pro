
import { SearchParams } from '../../types';
import { buildUrl } from './urlBuilder';
import { parseResponse } from './responseParser';
import { generateMockSearchResults } from '../mock/mockSearchGenerator';

/**
 * Выполняет запрос к Zylalabs API с возможностью отката на моки
 * @param params Параметры поиска
 * @returns Результаты поиска
 */
export const makeZylalabsApiRequest = async (params: SearchParams) => {
  // Проверяем, используем ли мы демо-режим
  if (useDemoModeForced) {
    console.log('Используется демо-режим, возвращаем моки');
    return generateMockSearchResults(params.query, params.page || 1);
  }

  try {
    // Получаем API ключ из локального хранилища
    const apiKey = localStorage.getItem('zylalabs_api_key');
    
    if (!apiKey) {
      console.error('Не найден API ключ для Zylalabs');
      throw new Error('API ключ не настроен. Пожалуйста, добавьте API ключ в настройках.');
    }
    
    // Формируем URL для запроса
    const url = buildUrl(params);
    console.log('Zylalabs URL запроса:', url);
    
    // Выполняем запрос к API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Проверяем статус ответа
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка Zylalabs API:', response.status, errorText);
      throw new Error(`Ошибка API: ${response.status} - ${errorText}`);
    }
    
    // Парсим ответ
    const data = await response.json();
    
    // Логируем структуру ответа для диагностики
    console.log('Структура ответа API:', Object.keys(data));
    if (data.data && data.data.products) {
      console.log('Количество товаров:', data.data.products.length);
      console.log('Пример товара:', data.data.products[0]);
    }
    
    // Применяем трансформацию данных
    return await parseResponse(data, params.query);
  } catch (error) {
    console.error('Ошибка при выполнении запроса к Zylalabs API:', error);
    
    // В случае ошибки возвращаем моки с пометкой о демо-режиме
    console.log('Возвращаем моки из-за ошибки API');
    const mockData = generateMockSearchResults(params.query, params.page || 1);
    return { ...mockData, isDemo: true };
  }
};

// Экспортируем функцию поиска товаров для использования в apiService
export const searchProducts = async (url: string) => {
  try {
    // Получаем API ключ из локального хранилища
    const apiKey = localStorage.getItem('zylalabs_api_key');
    
    if (!apiKey) {
      console.error('Не найден API ключ для Zylalabs');
      throw new Error('API ключ не настроен');
    }
    
    // Выполняем запрос к API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status}`);
    }
    
    // Возвращаем результат
    return await response.json();
  } catch (error) {
    console.error('Ошибка при выполнении запроса к Zylalabs API:', error);
    throw error;
  }
};

// Импортируем функцию для проверки демо-режима
import { useDemoModeForced } from '../mock/mockServiceConfig';

// Добавляем функцию для выполнения запросов по странам
export const makeZylalabsCountryRequest = async (query: string, countryCode: string, page: number = 1, language: string = 'en') => {
  // Создаем параметры для запроса по стране
  const params: SearchParams = {
    query,
    page,
    language,
    countries: [countryCode]
  };
  
  return makeZylalabsApiRequest(params);
};
