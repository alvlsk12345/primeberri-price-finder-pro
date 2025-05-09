
import { searchProductsViaZylalabs } from './api/zylalabsService';
import { Product, SearchParams } from './types';
import { toast } from "@/components/ui/sonner";
import { processZylalabsProductsData } from './formatters/productDataFormatter';

// Функция для поиска товаров с поддержкой пагинации и фильтрации
export const searchProducts = async (params: SearchParams): Promise<{ products: Product[], totalPages: number, isDemo?: boolean, apiInfo?: Record<string, string> }> => {
  try {
    console.log('Начинаем поиск товаров по запросу:', params.query, 'страница:', params.page);
    
    // Показываем уведомление о начале поиска
    const searchToastId = `search-${Date.now()}`;
    toast.loading('Поиск товаров...', { id: searchToastId });
    
    // Получаем данные от Zylalabs API с учетом пагинации
    const response = await searchProductsViaZylalabs(params);
    console.log('Ответ от API получен:', response);
    
    // Проверяем наличие результатов поиска
    if (!response || !response.products || response.products.length === 0) {
      toast.dismiss(searchToastId);
      toast.info('По вашему запросу ничего не найдено');
      return { products: [], totalPages: 0 };
    }
    
    // Проверяем, используются ли демо-данные
    const isDemo = !!response.isDemo;
    
    // Получаем информацию об API, если она доступна
    const apiInfo = response.apiInfo;
    
    // Обрабатываем данные о товарах
    const products = await processZylalabsProductsData(response.products, params.filters);
    
    // Закрываем уведомление о поиске
    toast.dismiss(searchToastId);
    
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
    return { products: [], totalPages: 0 };
  }
};

// Экспортируем функции из других сервисных модулей для обратной совместимости
export { getExchangeRate } from './exchangeService';
export { getProductLink } from './urlService';
export type { Product } from './types';
