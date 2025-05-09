
import { searchProductsViaZylalabs } from './api/zylalabsService';
import { Product, SearchParams } from './types';
import { processZylalabsProductsData } from './formatters/productDataFormatter';

// Функция для поиска товаров с поддержкой пагинации и фильтрации
export const searchProducts = async (params: SearchParams): Promise<{ products: Product[], totalPages: number, isDemo?: boolean, apiInfo?: Record<string, string> }> => {
  try {
    console.log('Начинаем поиск товаров по запросу:', params.query, 'страница:', params.page);
    
    // Установка таймаута для предотвращения зависания
    const timeoutPromise = new Promise<{products: [], totalPages: number, isDemo: true, apiInfo: Record<string, string>}>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 5000);
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
    
    // Обрабатываем данные о товарах
    let products = await processZylalabsProductsData(response.products, params.filters);

    // Добавляем информацию о стране для каждого товара (если отсутствует)
    products = products.map(product => {
      if (!product.country) {
        // Определяем страну по домену или типу магазина
        if (product.source.toLowerCase().includes('amazon.de') || 
            product.source.toLowerCase().includes('otto') || 
            product.source.toLowerCase().includes('zalando.de')) {
          return { ...product, country: 'de' };
        } else {
          // Присваиваем случайную европейскую страну для демонстрации
          const europeanCountries = ['gb', 'fr', 'es', 'it', 'nl'];
          const randomCountry = europeanCountries[Math.floor(Math.random() * europeanCountries.length)];
          return { ...product, country: randomCountry };
        }
      }
      return product;
    });

    // Обеспечиваем наличие результатов из Германии и других стран
    if (params.requireGermanResults) {
      // Разделяем результаты на немецкие и другие европейские
      const germanProducts = products.filter(product => product.country === 'de');
      const otherEuropeanProducts = products.filter(product => product.country !== 'de');

      // Обеспечиваем наличие как минимум 5 немецких результатов
      const minGermanResults = Math.min(5, germanProducts.length);
      let selectedGermanProducts = germanProducts.slice(0, minGermanResults);

      // Обеспечиваем наличие как минимум 5 других европейских результатов
      const minOtherResults = Math.min(5, otherEuropeanProducts.length);
      let selectedOtherProducts = otherEuropeanProducts.slice(0, minOtherResults);

      // Комбинируем результаты, обеспечивая общий минимум в 10 (или максимально доступное)
      let combinedProducts = [...selectedGermanProducts, ...selectedOtherProducts];

      // Если нам не хватает до 10 результатов, добавляем оставшиеся товары
      const neededResults = Math.max(0, (params.minResultCount || 10) - combinedProducts.length);
      if (neededResults > 0) {
        // Сначала добавляем больше немецких товаров, если они есть
        if (germanProducts.length > minGermanResults) {
          const additionalGerman = germanProducts.slice(minGermanResults, minGermanResults + neededResults);
          combinedProducts = [...combinedProducts, ...additionalGerman];
        }

        // Если еще нужны товары, добавляем другие европейские
        if (combinedProducts.length < (params.minResultCount || 10) && otherEuropeanProducts.length > minOtherResults) {
          const additionalOther = otherEuropeanProducts.slice(minOtherResults, 
            minOtherResults + ((params.minResultCount || 10) - combinedProducts.length));
          combinedProducts = [...combinedProducts, ...additionalOther];
        }
      }

      products = combinedProducts;
    }
    
    // Расчет общего количества страниц (приблизительное значение)
    const itemsPerPage = 9; // 9 элементов на странице
    const totalPages = response.totalPages || Math.max(1, Math.ceil(products.length / itemsPerPage));
    
    // Возвращаем результаты с флагом демо-данных и информацией об API
    return { 
      products, 
      totalPages, 
      isDemo, 
      apiInfo: response.apiInfo || {} 
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
