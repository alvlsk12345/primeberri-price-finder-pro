
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
    
    // Добавляем лимит количества товаров на страницу (увеличен с 10 до 36)
    url.searchParams.append('limit', '36');
    
    // Добавляем параметр для получения результатов из конечных магазинов
    url.searchParams.append('direct_shop_results', 'true');
    
    // Добавляем предпочитаемые магазины
    url.searchParams.append('shops_selection', 'amazon.de,otto.de,mediamarkt.de,zalando.de,saturn.de');
    
    // Логируем построенный URL
    console.log('Построенный URL для API:', url.toString());
    
    return url.toString();
  } catch (error) {
    console.error('Ошибка при построении URL:', error);
    throw new Error(`Ошибка при построении URL: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Вычисляет URL для конкретной страницы пагинации
 * @param baseUrl Базовый URL
 * @param page Номер страницы
 * @returns URL для указанной страницы
 */
export const calculatePageUrl = (baseUrl: string, page: number): string => {
  try {
    const url = new URL(baseUrl);
    
    // Обновляем или добавляем параметр страницы
    if (page > 1) {
      url.searchParams.set('page', page.toString());
    } else {
      url.searchParams.delete('page');
    }
    
    return url.toString();
  } catch (error) {
    console.error('Ошибка при создании URL страницы:', error);
    return baseUrl;
  }
};
