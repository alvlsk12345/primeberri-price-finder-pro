
import { searchProductsViaZylalabs } from './api/zylalabsService';
import { Product } from './types';
import { toast } from "@/components/ui/sonner";
import { processZylalabsProductsData } from './productFormatter';

// Функция для поиска товаров
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    console.log('Начинаем поиск товаров по запросу:', query);
    
    // Получаем данные от Zylalabs API
    const products = await searchProductsViaZylalabs(query);
    console.log('Ответ от API получен:', products);
    
    // Обрабатываем данные о товарах
    return processZylalabsProductsData(products);
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    toast.error('Произошла ошибка при поиске товаров');
    return [];
  }
};

// Экспортируем функции из других сервисных модулей для обратной совместимости
export { getExchangeRate } from './exchangeService';
export { getProductLink } from './urlService';
export type { Product } from './types';
