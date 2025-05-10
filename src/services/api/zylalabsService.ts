import { toast } from "sonner";
import { SearchParams } from "../types";
import { makeZylalabsApiRequest } from "./zylalabs";

// Функция для поиска товаров через Zylalabs API с поддержкой пагинации
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('zylalabsService: searchProductsViaZylalabs вызван с параметрами:', params);
  try {
    // Проверка, что используется правильная конечная точка API
    console.log('Используется endpoint: https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products');
    
    // Вызываем API напрямую без круговой зависимости
    const result = await makeZylalabsApiRequest(params);
    
    // Проверяем, имеет ли ответ структуру с вложенным объектом data
    if (result && result.data && result.data.products && result.data.products.length > 0) {
      // Используем данные из вложенного объекта data
      console.log(`API вернул данные в структуре с полем data, содержащим ${result.data.products.length} товаров`);
      
      // Модифицируем каждый продукт для правильного определения источника
      const products = result.data.products.map(product => {
        // Определяем источник товара (магазин)
        let source = "merchant"; // По умолчанию устанавливаем merchant
        
        // Попытка извлечь имя магазина из URL или других полей
        if (product.product_page_url) {
          try {
            const url = new URL(product.product_page_url);
            source = url.hostname.replace('www.', '').split('.')[0];
            // Если домен слишком общий (как google), проверяем дополнительно
            if (source === 'google' || source === 'shopping') {
              // Ищем реальный магазин в дополнительных данных
              if (product.offer && product.offer.store_name) {
                source = product.offer.store_name;
              } else if (product.merchant_name) {
                source = product.merchant_name;
              }
            }
          } catch (e) {
            // Если не удалось извлечь из URL, проверяем другие поля
            console.log('Не удалось извлечь имя магазина из URL:', e);
          }
        }
        
        // Проверяем другие возможные поля с информацией о магазине
        if (product.merchant_name) {
          source = product.merchant_name;
        } else if (product.offer && product.offer.store_name) {
          source = product.offer.store_name;
        } else if (product.source_name) {
          source = product.source_name;
        }
        
        // Если всё еще источник google, пробуем извлечь из других полей
        if (source === 'google' || source === 'shopping') {
          if (product.online_stores && product.online_stores.length > 0) {
            source = product.online_stores[0].name || source;
          }
        }
        
        // Добавляем информацию о стране
        let country = params.countries && params.countries.length > 0 
          ? params.countries[0].toUpperCase() 
          : 'DE';
          
        if (product.source_country) {
          country = product.source_country.toUpperCase();
        }
        
        // Обновляем продукт с правильным источником и страной
        return {
          ...product,
          source: source,
          country: country
        };
      });
      
      // Возвращаем обработанные данные
      console.log(`zylalabsService: Получено ${products.length} товаров из поля data`);
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
    // Проверяем обычную структуру ответа без вложенного объекта data
    else if (result && result.products && result.products.length > 0) {
      // Модифицируем каждый продукт для правильного определения источника
      result.products = result.products.map(product => {
        // Определяем источник товара (магазин)
        let source = "merchant"; // По умолчанию устанавливаем merchant
        
        // Попытка извлечь имя магазина из URL или других полей
        if (product.product_page_url) {
          try {
            const url = new URL(product.product_page_url);
            source = url.hostname.replace('www.', '').split('.')[0];
            // Если домен слишком общий (как google), проверяем дополнительно
            if (source === 'google' || source === 'shopping') {
              // Ищем реальный магазин в дополнительных данных
              if (product.offer && product.offer.store_name) {
                source = product.offer.store_name;
              } else if (product.merchant_name) {
                source = product.merchant_name;
              }
            }
          } catch (e) {
            // Если не удалось извлечь из URL, проверяем другие поля
            console.log('Не удалось извлечь имя магазина из URL:', e);
          }
        }
        
        // Проверяем другие возможные поля с информацией о магазине
        if (product.merchant_name) {
          source = product.merchant_name;
        } else if (product.offer && product.offer.store_name) {
          source = product.offer.store_name;
        } else if (product.source_name) {
          source = product.source_name;
        }
        
        // Если всё еще источник google, пробуем извлечь из других полей
        if (source === 'google' || source === 'shopping') {
          if (product.online_stores && product.online_stores.length > 0) {
            source = product.online_stores[0].name || source;
          }
        }
        
        // Добавляем информацию о стране
        let country = params.countries && params.countries.length > 0 
          ? params.countries[0].toUpperCase() 
          : 'DE';
          
        if (product.source_country) {
          country = product.source_country.toUpperCase();
        }
        
        // Обновляем продукт с правильным источником и страной
        return {
          ...product,
          source: source,
          country: country
        };
      });
      
      console.log(`zylalabsService: Получено ${result.products.length} товаров из прямого поля products`);
      return result;
    } else {
      console.warn('zylalabsService: API вернул пустой результат');
      return {
        products: [],
        totalPages: 0,
        isDemo: true,
        apiInfo: {}
      };
    }
  } catch (error) {
    console.error('Ошибка при вызове API:', error);
    // Перехватываем все непредвиденные ошибки здесь, чтобы не прерывать работу приложения
    toast.error('Произошла непредвиденная ошибка при поиске товаров');
    return {
      products: [],
      totalPages: 0,
      isDemo: true,
      apiInfo: {}
    };
  }
};
