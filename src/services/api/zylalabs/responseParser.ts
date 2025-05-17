
import { SearchParams, Product } from "../../types";
import { formatSingleProduct } from "../../formatters/singleProductFormatter";

// Добавляем экспорт parseResponse для обратной совместимости
export const parseResponse = async (data: any, originalQuery: string | SearchParams) => {
  // Получаем строку запроса
  const query = typeof originalQuery === 'string' ? originalQuery : originalQuery.query;
  
  // Проверяем есть ли данные и структура соответствует ожидаемой
  if (!data || !data.data || !Array.isArray(data.data.products)) {
    console.error('Некорректная структура ответа API:', data);
    return {
      products: [],
      totalPages: 0,
      isDemo: false,
      apiInfo: {
        error: 'Некорректная структура ответа API',
        source: 'API Error'
      }
    };
  }
  
  // Логируем полученные данные для диагностики
  console.log(`Получены данные от API Zylalabs: ${data.data.products.length} товаров`);
  
  try {
    // Преобразуем товары в нужный формат с использованием formatSingleProduct
    const productsPromises = data.data.products.map((item: any) => formatSingleProduct(item));
    const products = await Promise.all(productsPromises);
    
    console.log(`Успешно обработано ${products.length} товаров`);
    
    return {
      products,
      totalPages: data.data.totalPages || 1,
      isDemo: false,
      apiInfo: {
        source: 'Zylalabs API',
        query,
        totalResults: data.data.total?.toString() || '0'
      }
    };
  } catch (error) {
    console.error('Ошибка при форматировании товаров:', error);
    
    // В случае ошибки возвращаем упрощенную версию обработки
    const basicProducts = data.data.products.map((item: any) => ({
      id: item.id || `product-${Math.random().toString(36).substring(7)}`,
      title: item.title || 'Unknown Product',
      price: parseFloat(item.price) || 0,
      currency: item.currency || 'EUR',
      image: item.image || '',
      description: item.description || '',
      rating: item.rating || 0,
      url: item.url || '',
      source: item.source || 'Unknown',
      country: item.country || 'de',
      originalData: item
    }));
    
    return {
      products: basicProducts,
      totalPages: data.data.totalPages || 1,
      isDemo: false,
      apiInfo: {
        source: 'Zylalabs API (basic parsing)',
        query,
        totalResults: data.data.total?.toString() || '0',
        error: 'Ошибка при полной обработке товаров'
      }
    };
  }
};

// При необходимости можете добавить свою реализацию parseApiResponse
export const parseApiResponse = async (data: any, originalQuery: string | SearchParams) => {
  const query = typeof originalQuery === 'string' ? originalQuery : originalQuery.query;
  
  // Используем основную функцию parseResponse
  return parseResponse(data, query);
};
