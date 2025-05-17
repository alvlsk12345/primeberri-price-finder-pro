
import { toast } from "sonner";
import { SearchParams } from "../../types";
import { makeZylalabsApiRequest } from "./apiClient";
import { parseApiResponse } from "./responseParser";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";

/**
 * Основная функция для поиска товаров через Zylalabs API
 * @param params Параметры поиска
 * @returns Результаты поиска товаров
 */
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('apiService: searchProductsViaZylalabs вызван с параметрами:', params);
  try {
    // Проверка, что используется правильная конечная точка API
    console.log('Используется endpoint: https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products');
    
    // Вызываем API напрямую без круговой зависимости
    const result = await makeZylalabsApiRequest(params);
    console.log('Получен ответ от API Zylalabs:', Object.keys(result));
    
    // Проверяем наличие всех необходимых полей у товаров
    if (result.products && result.products.length > 0) {
      console.log('Проверка данных первого товара:');
      const firstProduct = result.products[0];
      console.log('- ID:', firstProduct.id);
      console.log('- Название:', firstProduct.title);
      console.log('- Цена:', firstProduct.price);
      console.log('- Изображение:', firstProduct.image ? 'Да' : 'Нет');
      console.log('- Магазин:', firstProduct.source);
      console.log('- Бренд:', firstProduct.brand);
    }
    
    // Преобразуем данные isDemo к строке для совместимости с существующим кодом
    const isDemo = result.isDemo ? "true" : "false";
    
    return {
      products: result.products || [],
      totalPages: result.totalPages || 1,
      isDemo,
      apiInfo: {
        ...result.apiInfo || {},
        isDemo
      }
    };
  } catch (error) {
    console.error('Ошибка при вызове API:', error);
    toast.error('Произошла непредвиденная ошибка при поиске товаров');
    
    // В случае ошибки используем демо-данные
    const demoData = generateMockSearchResults(params.query, params.page);
    return {
      products: demoData.products,
      totalPages: demoData.totalPages || 1,
      isDemo: "true",
      apiInfo: {
        error: 'Ошибка при вызове API',
        source: 'Demo Data',
        isDemo: "true"
      }
    };
  }
};
