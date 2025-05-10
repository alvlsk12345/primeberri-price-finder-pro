import { toast } from "sonner";
import { SearchParams } from "../types";
import { makeZylalabsApiRequest } from "./zylalabs";
import { generateMockSearchResults } from "./mock/mockSearchGenerator";

// Функция для поиска товаров через Zylalabs API с поддержкой пагинации
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('zylalabsService: searchProductsViaZylalabs вызван с параметрами:', params);
  try {
    // Проверка, что используется правильная конечная точка API
    console.log('Используется endpoint: https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products');
    
    // Вызываем API напрямую без круговой зависимости
    const result = await makeZylalabsApiRequest(params);
    console.log('Получен ответ от API Zylalabs:', Object.keys(result));
    
    // Проверяем структуру ответа - новая структура с data.data (массив)
    if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
      console.log(`API вернул данные в структуре data.data (массив), найдено ${result.data.data.length} товаров`);
      
      const products = result.data.data.map(product => {
        // Определяем источник товара (магазин)
        let source = "merchant"; 
        
        if (product.product_page_url) {
          try {
            const url = new URL(product.product_page_url);
            source = url.hostname.replace('www.', '').split('.')[0];
            if (source === 'google' || source === 'shopping') {
              if (product.offer && product.offer.store_name) {
                source = product.offer.store_name;
              } else if (product.merchant_name) {
                source = product.merchant_name;
              }
            }
          } catch (e) {
            console.log('Не удалось извлечь имя магазина из URL');
          }
        }
        
        if (product.merchant_name) {
          source = product.merchant_name;
        } else if (product.offer && product.offer.store_name) {
          source = product.offer.store_name;
        } else if (product.source_name) {
          source = product.source_name;
        }
        
        let country = params.countries && params.countries.length > 0 
          ? params.countries[0].toUpperCase() 
          : 'DE';
          
        if (product.source_country) {
          country = product.source_country.toUpperCase();
        }
        
        return {
          ...product,
          source: source,
          country: country
        };
      });
      
      // Возвращаем обработанные данные с оригинальной структурой ответа
      console.log(`zylalabsService: Обработано ${products.length} товаров из data.data (массив)`);
      return {
        products: products,
        totalPages: result.data.total_pages || 1,
        isDemo: false,
        apiInfo: {
          totalResults: result.data.total_results ? `${result.data.total_results}` : '0',
          searchTime: result.data.search_time ? `${result.data.search_time}s` : 'н/д',
          source: 'Zylalabs API',
          remainingCalls: result.remainingCalls || 'н/д'
        }
      };
    }
    // Проверяем структуру с data.products
    else if (result && result.data && result.data.products && Array.isArray(result.data.products)) {
      console.log(`API вернул данные в структуре с data.products, найдено ${result.data.products.length} товаров`);
      
      const products = result.data.products.map(product => {
        // Определяем источник товара (магазин)
        let source = "merchant"; 
        
        if (product.product_page_url) {
          try {
            const url = new URL(product.product_page_url);
            source = url.hostname.replace('www.', '').split('.')[0];
            if (source === 'google' || source === 'shopping') {
              if (product.offer && product.offer.store_name) {
                source = product.offer.store_name;
              } else if (product.merchant_name) {
                source = product.merchant_name;
              }
            }
          } catch (e) {
            console.log('Не удалось извлечь имя магазина из URL');
          }
        }
        
        if (product.merchant_name) {
          source = product.merchant_name;
        } else if (product.offer && product.offer.store_name) {
          source = product.offer.store_name;
        } else if (product.source_name) {
          source = product.source_name;
        }
        
        let country = params.countries && params.countries.length > 0 
          ? params.countries[0].toUpperCase() 
          : 'DE';
          
        if (product.source_country) {
          country = product.source_country.toUpperCase();
        }
        
        return {
          ...product,
          source: source,
          country: country
        };
      });
      
      console.log(`zylalabsService: Обработано ${products.length} товаров из data.products`);
      return {
        products: products,
        totalPages: result.data.total_pages || 1,
        isDemo: false,
        apiInfo: {
          totalResults: result.data.total_results ? `${result.data.total_results}` : '0',
          searchTime: result.data.search_time ? `${result.data.search_time}s` : 'н/д',
          source: 'Zylalabs API',
          remainingCalls: result.remainingCalls || 'н/д'
        }
      };
    } 
    // Проверка оригинального формата ответа (без вложенного data)
    else if (result && result.products && Array.isArray(result.products)) {
      console.log(`API вернул данные в оригинальном формате, найдено ${result.products.length} товаров`);
      
      // Модифицируем каждый продукт для правильного определения источника
      const products = result.products.map(product => {
        // Определяем источник товара (магазин)
        let source = "merchant"; 
        
        if (product.product_page_url) {
          try {
            const url = new URL(product.product_page_url);
            source = url.hostname.replace('www.', '').split('.')[0];
            if (source === 'google' || source === 'shopping') {
              if (product.offer && product.offer.store_name) {
                source = product.offer.store_name;
              } else if (product.merchant_name) {
                source = product.merchant_name;
              }
            }
          } catch (e) {
            console.log('Не удалось извлечь имя магазина из URL');
          }
        }
        
        if (product.merchant_name) {
          source = product.merchant_name;
        } else if (product.offer && product.offer.store_name) {
          source = product.offer.store_name;
        } else if (product.source_name) {
          source = product.source_name;
        }
        
        let country = params.countries && params.countries.length > 0 
          ? params.countries[0].toUpperCase() 
          : 'DE';
          
        if (product.source_country) {
          country = product.source_country.toUpperCase();
        }
        
        return {
          ...product,
          source: source,
          country: country
        };
      });
      
      return {
        products: products,
        totalPages: result.totalPages || 1,
        isDemo: false,
        apiInfo: {
          totalResults: '?',
          searchTime: '?',
          source: 'Zylalabs API',
          remainingCalls: result.remainingCalls || 'н/д'
        }
      };
    } else {
      // Логирование структуры ответа
      console.warn('zylalabsService: Необработанная структура ответа API:', result);
      console.warn('Типы полей результата:', 
        Object.entries(result || {}).map(([key, value]) => 
          `${key}: ${Array.isArray(value) ? 'Array' : typeof value}`
        ));
      
      // Попытка найти продукты в любой структуре
      const demoData = generateMockSearchResults(params.query, params.page);
      
      toast.error('Получена неожиданная структура ответа API. Используем демо-данные.');
      return {
        products: demoData.products,
        totalPages: demoData.totalPages || 1,
        isDemo: true,
        apiInfo: {
          error: 'Неожиданная структура ответа API',
          source: 'Demo Data'
        }
      };
    }
  } catch (error) {
    console.error('Ошибка при вызове API:', error);
    toast.error('Произошла непредвиденная ошибка при поиске товаров');
    
    // В случае ошибки используем демо-данные
    const demoData = generateMockSearchResults(params.query, params.page);
    return {
      products: demoData.products,
      totalPages: demoData.totalPages || 1,
      isDemo: true,
      apiInfo: {
        error: 'Ошибка при вызове API',
        source: 'Demo Data'
      }
    };
  }
};
