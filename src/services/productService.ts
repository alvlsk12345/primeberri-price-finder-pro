
import { searchProductsViaZylalabs } from './api/zylalabsService';
import { Product, SearchParams } from './types';
import { toast } from "@/components/ui/sonner";
import { processZylalabsProductsData } from './productFormatter';

// Функция для поиска товаров с поддержкой пагинации и фильтрации
export const searchProducts = async (params: SearchParams): Promise<{ products: Product[], totalPages: number }> => {
  try {
    console.log('Начинаем поиск товаров по запросу:', params.query, 'страница:', params.page);
    
    // Получаем данные от Zylalabs API с учетом пагинации
    const response = await searchProductsViaZylalabs(params);
    console.log('Ответ от API получен:', response);
    
    // Обрабатываем данные о товарах
    const products = processZylalabsProductsData(response.products, params.filters);
    
    // Предполагаем, что на странице отображается до 12 товаров
    const totalPages = Math.ceil(response.total || products.length / 12);
    
    return { products, totalPages: totalPages || 1 };
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
