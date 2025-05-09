
import { searchProductsViaZylalabs } from './api/zylalabsService';
import { Product, SearchParams } from './types';
import { toast } from "sonner";
import { processZylalabsProductsData } from './formatters/productDataFormatter';

// Функция для поиска товаров с поддержкой пагинации и фильтрации
export const searchProducts = async (params: SearchParams): Promise<{ products: Product[], totalPages: number, isDemo?: boolean, apiInfo?: Record<string, string> }> => {
  try {
    console.log('Начинаем поиск товаров по запросу:', params.query, 'страница:', params.page);
    
    // Показываем уведомление о начале поиска
    const searchToastId = `search-${Date.now()}`;
    toast.loading('Поиск товаров...', { id: searchToastId });
    
    // Установка таймаута для предотвращения зависания
    const timeoutPromise = new Promise<{products: [], totalPages: number, isDemo: true}>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
    
    // Получаем данные от Zylalabs API с учетом пагинации и добавляем таймаут
    const response = await Promise.race([
      searchProductsViaZylalabs(params),
      timeoutPromise
    ]).catch(error => {
      console.warn('Поиск был прерван из-за таймаута или ошибки:', error);
      return { products: [], total: 0, isDemo: true, apiInfo: {} };
    });
    
    console.log('Ответ от API получен:', response);
    
    // Закрываем уведомление о поиске
    toast.dismiss(searchToastId);
    
    // Проверяем наличие результатов поиска
    if (!response || !response.products || response.products.length === 0) {
      toast.info('По вашему запросу ничего не найдено');
      return { products: [], totalPages: 0, isDemo: true };
    }
    
    // Проверяем, используются ли демо-данные
    const isDemo = !!response.isDemo;
    
    // Получаем информацию об API, если она доступна
    const apiInfo = response.apiInfo || {};
    
    // Обрабатываем данные о товарах
    const products = await processZylalabsProductsData(response.products, params.filters);
    
    // Расчет общего количества страниц (приблизительное значение)
    const itemsPerPage = 12; // Стандартное количество элементов на странице
    const totalItems = response.total || products.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    
    // Информируем пользователя о результатах
    if (products.length > 0) {
      toast.success(`Найдено ${products.length} товаров${totalPages > 1 ? `, стр. ${params.page}/${totalPages}` : ''}`);
    } else {
      toast.info('По вашему запросу ничего не найдено');
    }
    
    // Возвращаем результаты с флагом демо-данных и информацией об API
    return { products, totalPages, isDemo, apiInfo };
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    toast.error('Произошла ошибка при поиске товаров');
    return { products: [], totalPages: 0, isDemo: true };
  }
};

// Экспортируем функции из других сервисных модулей для обратной совместимости
export { getExchangeRate } from './exchangeService';
export { getProductLink } from './urlService';
export type { Product } from './types';
