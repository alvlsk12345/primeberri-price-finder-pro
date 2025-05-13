
import { toast } from "sonner";
import { makeZylalabsCountryRequest } from "./apiClient";
import { Product } from "../../types";
import { mapProductsFromApi } from "./productMapper";
import { getCachedResponse, setCacheResponse } from "./cacheService";

// Страны ЕС для поиска товаров (исключая Германию, которая обрабатывается отдельно)
const OTHER_EU_COUNTRIES = ['fr', 'es', 'it', 'nl', 'be', 'pl', 'se', 'at', 'ie', 'pt'];

// Константы для оптимизации
const MIN_PRODUCTS = 24; // Минимальное количество товаров для поиска
const MAX_PRODUCTS = 36; // Максимальное количество товаров
const MIN_GERMAN_PRODUCTS = 8; // Минимальное количество товаров из Германии
const COUNTRIES_PER_BATCH = 3; // Увеличиваем количество стран в одном батче для параллельного запроса
const REQUEST_TIMEOUT = 15000; // Уменьшаем таймаут до 15 секунд для более быстрого ответа

/**
 * Функция для перемешивания массива 
 * @param array Массив для перемешивания
 * @returns Перемешанный массив
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
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
    // Шаг 2: Создаем запросы для всех стран сразу, включая Германию на первом месте
    // для параллельного выполнения
    const allCountries = ['de', ...shuffleArray(OTHER_EU_COUNTRIES)];
    
    // Создаем запросы для всех стран с ограничением по времени
    const countryPromises = allCountries.map(async (countryCode) => {
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

    // Обработка результатов
    countryResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        const { products, country } = result.value;
        
        // Разделяем результаты из Германии и других стран
        if (country === 'de') {
          for (const product of products) {
            if (product.id && !displayedProductIds.has(product.id)) {
              germanProducts.push({ ...product, country });
              displayedProductIds.add(product.id);
            }
          }
          
          // Обновляем информацию об API
          apiInfo.totalGerman = germanProducts.length.toString();
          console.log(`Успешно обработаны ${germanProducts.length} товаров из Германии`);
        } else {
          for (const product of products) {
            if (product.id && !displayedProductIds.has(product.id)) {
              otherEuProducts.push({ ...product, country });
              displayedProductIds.add(product.id);
            }
          }
        }
      }
    });
    
    // Обновляем API информацию
    apiInfo.totalGerman = germanProducts.length.toString();
    apiInfo.totalOtherEu = otherEuProducts.length.toString();
    
    // Объединяем все найденные товары, отдавая приоритет товарам из Германии
    const allDisplayProducts = [...germanProducts, ...otherEuProducts];
    console.log(`Всего найдено товаров: ${allDisplayProducts.length} (${germanProducts.length} из Германии, ${otherEuProducts.length} из других стран ЕС)`);
    
    // Проверяем, есть ли у нас минимум товаров из Германии
    if (germanProducts.length < MIN_GERMAN_PRODUCTS && germanProducts.length > 0) {
      console.log(`Внимание! Найдено менее ${MIN_GERMAN_PRODUCTS} товаров из Германии (${germanProducts.length}), дублируем немецкие товары`);
      
      // Дублируем имеющиеся немецкие товары, если их меньше минимума
      while (germanProducts.length > 0 && germanProducts.length < MIN_GERMAN_PRODUCTS) {
        const indexToDuplicate = germanProducts.length % germanProducts.length;
        const duplicatedProduct = {...germanProducts[indexToDuplicate]};
        
        // Модифицируем ID, чтобы React не жаловался на дубликаты ключей
        duplicatedProduct.id = `${duplicatedProduct.id}-dup-de-${germanProducts.length}`;
        germanProducts.push(duplicatedProduct);
      }
      
      // Обновляем общий список с дополнительными товарами из Германии
      const updatedAllProducts = [...germanProducts, ...otherEuProducts];
      console.log(`После дублирования товаров из Германии: ${germanProducts.length} из DE, всего ${updatedAllProducts.length}`);
      
      // Обновляем список всех товаров
      allDisplayProducts.length = 0;
      allDisplayProducts.push(...updatedAllProducts);
    }
    
    // Возвращаем результаты поиска
    if (allDisplayProducts.length > 0) {
      // Обеспечиваем минимум товаров для улучшения отображения
      if (allDisplayProducts.length < MIN_PRODUCTS) {
        console.log(`Найдено менее ${MIN_PRODUCTS} товаров (${allDisplayProducts.length}), дублируем некоторые товары для достижения минимума`);
        // Дублируем имеющиеся товары, чтобы достичь минимума
        while (allDisplayProducts.length < MIN_PRODUCTS) {
          const indexToDuplicate = allDisplayProducts.length % allDisplayProducts.length;
          const duplicatedProduct = {...allDisplayProducts[indexToDuplicate]};
          // Модифицируем ID, чтобы React не жаловался на дубликаты ключей
          duplicatedProduct.id = `${duplicatedProduct.id}-dup-${allDisplayProducts.length}`;
          allDisplayProducts.push(duplicatedProduct);
        }
      } else if (allDisplayProducts.length > MAX_PRODUCTS) {
        // Ограничиваем до максимального количества товаров
        allDisplayProducts.length = MAX_PRODUCTS;
        console.log(`Ограничиваем список товаров до ${MAX_PRODUCTS}`);
      }
      
      // Правильно рассчитываем количество страниц
      const itemsPerPage = 12;
      const calculatedPages = Math.ceil(allDisplayProducts.length / itemsPerPage);
      
      // Обновляем API информацию
      apiInfo.totalProducts = allDisplayProducts.length.toString();
      apiInfo.totalPages = calculatedPages.toString();
      apiInfo.source = 'Zylalabs EU Search (Optimized)';
      
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
