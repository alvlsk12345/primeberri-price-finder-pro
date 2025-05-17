
import { BASE_URL } from "./config";
import { SearchParams } from "../../types";

/**
 * Строит URL для запроса к API Zylalabs
 * @param params Параметры поиска
 * @returns Полный URL для запроса
 */
export const buildUrl = (params: SearchParams): string => {
  try {
    // Проверяем наличие обязательных параметров
    if (!params.query) {
      console.error('Отсутствует обязательный параметр query');
      throw new Error('Отсутствует обязательный параметр query');
    }
    
    // Извлекаем базовый URL из конфигурации
    let url = new URL(BASE_URL);
    
    // Добавляем параметры запроса
    url.searchParams.append('q', params.query);
    
    // Добавляем параметр страницы (если указан)
    if (params.page && params.page > 1) {
      url.searchParams.append('page', params.page.toString());
    }
    
    // Добавляем параметр языка (если указан) для получения локализованных результатов
    if (params.language) {
      url.searchParams.append('language', params.language);
    }
    
    // Добавляем параметр страны (по умолчанию используем Германию)
    if (params.countries && params.countries.length > 0) {
      url.searchParams.append('country', params.countries[0]);
    } else {
      url.searchParams.append('country', 'de');
    }
    
    // Добавляем лимит количества товаров на страницу (по умолчанию 10)
    url.searchParams.append('limit', '10');
    
    // Логируем построенный URL
    console.log('Построенный URL для API:', url.toString());
    
    return url.toString();
  } catch (error) {
    console.error('Ошибка при построении URL:', error);
    throw new Error(`Ошибка при построении URL: ${error instanceof Error ? error.message : String(error)}`);
  }
};
