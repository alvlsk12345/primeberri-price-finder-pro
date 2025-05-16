
import { toast } from "sonner";
import { makeZylalabsCountryRequest } from "./apiClient";
import { Product } from "../../types";
import { mapProductsFromApi } from "./productMapper";
import { getCachedResponse, setCacheResponse } from "./cacheService";

// Приоритетные страны ЕС для поиска товаров
const PRIORITY_EU_COUNTRIES = ['de', 'fr', 'es', 'it', 'nl', 'be', 'pl', 'se', 'at', 'ie', 'pt'];

// Константы для оптимизации
const MIN_PRODUCTS = 24; // Минимальное количество товаров для поиска
const MAX_PRODUCTS = 36; // Максимальное количество товаров
const MIN_GERMAN_PRODUCTS = 8; // Минимальное количество товаров из Германии
const REQUEST_TIMEOUT = 15000; // Уменьшаем таймаут до 15 секунд для более быстрого ответа

/**
 * Получает уникальный идентификатор товара, учитывая возможные дубликаты
 * @param product Товар для идентификации
 * @returns Уникальный идентификатор товара
 */
function getUniqueProductId(product: Product): string {
  // Используем комбинацию полей для более точной идентификации
  const baseId = product.id || '';
  const title = (product.title || '').slice(0, 50); // Обрезаем до 50 символов чтобы избежать различий из-за длинны
  const price = product.price?.toString() || '';
  
  return `${baseId}-${title}-${price}`.trim().toLowerCase();
}

/**
 * Поиск товаров по странам ЕС, начиная с Германии
 * @param query Поисковый запрос
 * @param page Страница поиска
 * @returns Список найденных товаров и информация о поиске
 */
export const searchEuProducts = async (query: string, page: number = 1): Promise<{
  products: Product[],
  totalPages: number,
  isDemo: boolean,
  apiInfo: Record<string, string>
}> => {
  console.log(`Начинаем параллельный поиск товаров в странах ЕС по запросу: "${query}", страница: ${page}`);
  
  // Сохраняем все найденные товары
  let germanProducts: Product[] = [];
  let otherEuProducts: Product[] = [];
  const displayedProductIds = new Set<string>();
  const apiInfo: Record<string, string> = {};
  
  // Шаг 1: Проверяем кэш для запроса
  const cacheKey = `eu-search-${query}-${page}`;
  const cachedResults = getCachedResponse(cacheKey);
  if (cachedResults) {
    console.log('Найдены кэшированные результаты поиска');
    return cachedResults;
  }

  // Показываем уведомление о начале поиска
  const searchToastId = 'search-progress';
  toast.loading('Выполняется поиск товаров...', { id: searchToastId, duration: 30000 });
  
  try {
    // Шаг 2: Создаем запросы в приоритетном порядке стран
    // Германия всегда на первом месте, остальные страны в фиксированном порядке
    console.log(`Поиск в странах: [${PRIORITY_EU_COUNTRIES.join(', ')}]`);
    
    // Создаем запросы для всех стран с ограничением по времени
    const countryPromises = PRIORITY_EU_COUNTRIES.map(async (countryCode) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      try {
        console.log(`Параллельный поиск в ${countryCode.toUpperCase()}...`);
        const countryData = await makeZylalabsCountryRequest(query, countryCode, page, 'ru');
        clearTimeout(timeoutId);
        
        if (countryData?.status === "OK" && countryData?.data?.products) {
          console.log(`Найдено ${countryData.data.products.length} товаров в ${countryCode.toUpperCase()}`);
          
          // Преобразовываем товары из API
          const mappedCountryProducts = mapProductsFromApi(countryData.data.products, {
            query,
            countries: [countryCode],
            language: 'ru'
          });
          
          // Возвращаем продукты и страну
          return {
            products: mappedCountryProducts,
            country: countryCode,
            success: true
          };
        }
        return { products: [], country: countryCode, success: false };
      } catch (err) {
        clearTimeout(timeoutId);
        console.error(`Ошибка при запросе к ${countryCode}:`, err);
        return { products: [], country: countryCode, success: false };
      }
    });
    
    // Выполняем все запросы параллельно
    const countryResults = await Promise.allSettled(countryPromises);
    toast.dismiss(searchToastId);

    // Обработка результатов с устранением дубликатов
    const uniqueProducts = new Map<string, Product>();
    
    countryResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        const { products, country } = result.value;
        
        // Добавляем только уникальные продукты
        for (const product of products) {
          const uniqueId = getUniqueProductId(product);
          
          // Если товар еще не добавлен, добавляем его
          if (!uniqueProducts.has(uniqueId)) {
            uniqueProducts.set(uniqueId, { ...product, country });
            
            // Разделяем результаты из Германии и других стран
            if (country === 'de') {
              germanProducts.push({ ...product, country });
            } else {
              otherEuProducts.push({ ...product, country });
            }
          }
        }
      }
    });
    
    // Обновляем API информацию
    apiInfo.totalGerman = germanProducts.length.toString();
    apiInfo.totalOtherEu = otherEuProducts.length.toString();
    apiInfo.uniqueProductCount = uniqueProducts.size.toString();
    
    console.log(`Найдено ${germanProducts.length} уникальных товаров из Германии, ${otherEuProducts.length} из других стран ЕС`);
    
    // Объединяем все найденные товары, отдавая приоритет товарам из Германии
    let allDisplayProducts = [...germanProducts, ...otherEuProducts];
    
    // Проверка минимального количества товаров из Германии
    if (germanProducts.length < MIN_GERMAN_PRODUCTS && germanProducts.length > 0 && allDisplayProducts.length > 0) {
      console.log(`Внимание! Найдено недостаточно товаров из Германии (${germanProducts.length})`);
      
      // Обеспечиваем минимальное количество товаров для отображения
      if (allDisplayProducts.length < MIN_PRODUCTS) {
        console.log(`Найдено менее ${MIN_PRODUCTS} товаров (${allDisplayProducts.length}), добавляем товары из других стран`);
        
        // Добавляем товары из других стран, чтобы достичь минимума
        const needed = Math.min(MIN_PRODUCTS - allDisplayProducts.length, otherEuProducts.length);
        if (needed > 0 && otherEuProducts.length > 0) {
          const additionalProducts = otherEuProducts.slice(0, needed)
            .map(product => ({
              ...product,
              id: `${product.id}-additional-${Math.random().toString(36).substring(7)}` // Гарантируем уникальность ID
            }));
            
          allDisplayProducts = [...germanProducts, ...otherEuProducts, ...additionalProducts];
          console.log(`Добавлено ${additionalProducts.length} дополнительных товаров из других стран`);
        }
      }
    } else if (allDisplayProducts.length > MAX_PRODUCTS) {
      // Ограничиваем до максимального количества товаров
      console.log(`Ограничиваем количество товаров до ${MAX_PRODUCTS}`);
      // Сохраняем все немецкие товары
      const keptGermanProducts = germanProducts.slice(0, Math.min(germanProducts.length, MAX_PRODUCTS));
      // Добавляем товары из других стран до достижения MAX_PRODUCTS
      const keptOtherProducts = otherEuProducts.slice(0, MAX_PRODUCTS - keptGermanProducts.length);
      allDisplayProducts = [...keptGermanProducts, ...keptOtherProducts];
    }
    
    // Возвращаем результаты поиска
    if (allDisplayProducts.length > 0) {
      // Правильно рассчитываем количество страниц
      const itemsPerPage = 12;
      const calculatedPages = Math.ceil(allDisplayProducts.length / itemsPerPage);
      
      // Обновляем API информацию
      apiInfo.totalProducts = allDisplayProducts.length.toString();
      apiInfo.totalPages = calculatedPages.toString();
      apiInfo.source = 'Zylalabs EU Search (Optimized)';
      apiInfo.searchCountries = PRIORITY_EU_COUNTRIES.join(',');
      apiInfo.germanProductCount = germanProducts.length.toString();
      apiInfo.otherEuProductCount = otherEuProducts.length.toString();
      
      console.log(`Итого товаров: ${allDisplayProducts.length}, страниц: ${calculatedPages} (по ${itemsPerPage} на страницу)`);
      
      const result = {
        products: allDisplayProducts,
        totalPages: calculatedPages,
        isDemo: false,
        apiInfo
      };
      
      // Кэшируем результаты для повторного использования
      setCacheResponse(cacheKey, result);
      
      return result;
    } else {
      console.log('Не найдено товаров ни в одной из стран ЕС');
      toast.error('Не найдено товаров ни в одной из стран ЕС. Попробуйте другой запрос.', { duration: 3000 });
      return {
        products: [],
        totalPages: 0,
        isDemo: false,
        apiInfo: {
          error: 'Не найдено товаров ни в одной из стран ЕС',
          source: 'Zylalabs EU Search'
        }
      };
    }
  } catch (error) {
    toast.dismiss(searchToastId);
    console.error('Ошибка при поиске товаров:', error);
    toast.error('Произошла ошибка при поиске товаров. Попробуйте снова.', { duration: 3000 });
    return {
      products: [],
      totalPages: 0,
      isDemo: false,
      apiInfo: {
        error: 'Ошибка при поиске товаров',
        source: 'Zylalabs EU Search'
      }
    };
  }
};
