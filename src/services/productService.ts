
import { searchProductsViaZylalabs } from './api/zylalabsService';
import { Product, SearchParams } from './types';
import { processZylalabsProductsData } from './formatters/productDataFormatter';

// Функция для поиска товаров с поддержкой пагинации и фильтрации
export const searchProducts = async (params: SearchParams): Promise<{ products: Product[], totalPages: number, isDemo?: boolean, apiInfo?: Record<string, string> }> => {
  try {
    console.log('Начинаем поиск товаров по запросу:', params.query, 'страница:', params.page);
    
    // Установка таймаута для предотвращения зависания (увеличено до 20 секунд)
    const timeoutPromise = new Promise<{products: [], totalPages: number, isDemo: true, apiInfo: Record<string, string>}>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 20000);
    });
    
    // Получаем данные от Zylalabs API с учетом пагинации и добавляем таймаут
    const response = await Promise.race([
      searchProductsViaZylalabs(params),
      timeoutPromise
    ]).catch(error => {
      console.warn('Поиск был прерван из-за таймаута или ошибки:', error);
      return { products: [], totalPages: 0, isDemo: true, apiInfo: {} };
    });
    
    console.log('Ответ от API получен для страницы', params.page, ':', response);
    
    // Проверяем наличие результатов поиска
    if (!response || !response.products || response.products.length === 0) {
      console.log('По вашему запросу ничего не найдено');
      return { products: [], totalPages: 0, isDemo: true, apiInfo: {} };
    }
    
    // Проверяем, используются ли демо-данные
    const isDemo = !!response.isDemo;
    
    // Создаем Map для отслеживания уникальных товаров по ID
    const uniqueProductsMap = new Map<string, Product>();
    
    // Обрабатываем данные о товарах
    let products = await processZylalabsProductsData(response.products, params.filters);

    // Проверяем, есть ли у продуктов информация о стране, если нет - добавляем её
    products = products.map(product => {
      // Если у товара уже есть информация о стране, оставляем её без изменений
      if (product.country) {
        return product;
      }
      
      // Определяем страну по домену или типу магазина
      if (product.source) {
        const source = product.source.toLowerCase();
        if (source.includes('amazon.de') || source.includes('otto') || source.includes('zalando.de')) {
          return { ...product, country: 'de' };
        } else if (source.includes('amazon.fr') || source.includes('fnac')) {
          return { ...product, country: 'fr' };
        } else if (source.includes('amazon.es')) {
          return { ...product, country: 'es' };
        } else if (source.includes('amazon.it')) {
          return { ...product, country: 'it' };
        } else if (source.includes('amazon.nl') || source.includes('bol.com')) {
          return { ...product, country: 'nl' };
        }
      }
      
      // Если не удалось определить страну, присваиваем случайную европейскую страну 
      const europeanCountries = ['fr', 'es', 'it', 'nl', 'be', 'pl'];
      const randomIndex = Math.floor(Math.random() * europeanCountries.length);
      return { ...product, country: europeanCountries[randomIndex] };
    });

    // Добавляем только уникальные товары в Map
    products.forEach(product => {
      const productKey = `${product.title}-${product.price}`;
      if (!uniqueProductsMap.has(productKey)) {
        uniqueProductsMap.set(productKey, product);
      }
    });
    
    // Преобразуем Map обратно в массив
    products = Array.from(uniqueProductsMap.values());
    console.log(`После удаления дубликатов осталось ${products.length} уникальных товаров`);

    // Разделяем товары на немецкие и другие европейские
    const germanProducts = products.filter(product => product.country === 'de');
    const otherEuropeanProducts = products.filter(product => product.country !== 'de');
    
    console.log(`Разделение товаров: ${germanProducts.length} из Германии, ${otherEuropeanProducts.length} из других стран ЕС`);

    // Обеспечиваем приоритет товаров из Германии
    if (params.requireGermanResults) {
      // Определяем минимальное количество товаров из Германии для показа
      const minGermanResults = Math.min(6, germanProducts.length);
      
      // Отбираем товары из Германии
      const selectedGermanProducts = germanProducts.slice(0, minGermanResults);
      
      // Отбираем товары из других стран
      const minOtherResults = Math.min(params.minResultCount ? params.minResultCount - minGermanResults : 6, otherEuropeanProducts.length);
      const selectedOtherProducts = otherEuropeanProducts.slice(0, minOtherResults);
      
      // Комбинируем результаты, отдавая приоритет товарам из Германии
      let combinedProducts = [...selectedGermanProducts, ...selectedOtherProducts];
      
      // Если нам не хватает до минимального количества результатов, добавляем оставшиеся товары
      const neededResults = Math.max(0, (params.minResultCount || 12) - combinedProducts.length);
      if (neededResults > 0) {
        // Сначала добавляем больше немецких товаров, если они есть
        if (germanProducts.length > minGermanResults) {
          const additionalGerman = germanProducts.slice(minGermanResults, minGermanResults + neededResults);
          combinedProducts = [...combinedProducts, ...additionalGerman];
        }
        
        // Если еще нужны товары, добавляем другие европейские
        if (combinedProducts.length < (params.minResultCount || 12) && otherEuropeanProducts.length > minOtherResults) {
          const additionalOther = otherEuropeanProducts.slice(minOtherResults, 
            minOtherResults + ((params.minResultCount || 12) - combinedProducts.length));
          combinedProducts = [...combinedProducts, ...additionalOther];
        }
      }
      
      // Обновляем список товаров
      products = combinedProducts;
      console.log(`После приоритизации: ${products.length} товаров (из них ${selectedGermanProducts.length} из Германии)`);
    }
    
    // Максимальное количество - 36 товаров
    if (products.length > 36) {
      products = products.slice(0, 36);
      console.log(`Ограничение количества товаров до 36`);
    }
    
    // Расчет общего количества страниц
    const itemsPerPage = 12; // 12 элементов на странице
    const totalPages = response.totalPages || Math.max(1, Math.ceil(products.length / itemsPerPage));
    
    console.log(`Итоговое количество товаров: ${products.length}, страниц: ${totalPages}`);
    
    // Возвращаем результаты с флагом демо-данных и информацией об API
    return { 
      products, 
      totalPages, 
      isDemo, 
      apiInfo: {
        ...response.apiInfo,
        finalProductCount: products.length.toString(),
        germanCount: germanProducts.length.toString(),
        otherEuCount: otherEuropeanProducts.length.toString()
      }
    };
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    return { products: [], totalPages: 0, isDemo: true, apiInfo: {} };
  }
};

// Экспортируем функции из других сервисных модулей для обратной совместимости
export { getExchangeRate } from './exchangeService';
export { getProductLink } from './urlService';
export type { Product } from './types';
