
import { toast } from "sonner";
import { makeZylalabsCountryRequest } from "./apiClient";
import { Product } from "../../types";
import { mapProductsFromApi } from "./productMapper";

// Страны ЕС для поиска товаров (исключая Германию, которая обрабатывается отдельно)
const OTHER_EU_COUNTRIES = ['fr', 'es', 'it', 'nl', 'be', 'pl', 'se', 'at', 'ie', 'pt'];

/**
 * Функция для перемешивания массива (как в HTML-примере)
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
  console.log(`Начинаем поиск товаров в странах ЕС по запросу: "${query}", страница: ${page}`);
  
  // Сохраняем все найденные товары
  let germanProducts: Product[] = [];
  let otherEuProducts: Product[] = [];
  const displayedProductIds = new Set<string>();
  
  // Шаг 1: Поиск товаров в Германии (теперь до 6 товаров для обеспечения минимума 12)
  console.log('Поиск товаров в Германии...');
  const germanData = await makeZylalabsCountryRequest(query, 'de', page, 'ru');
  
  if (germanData && germanData.status === "OK" && germanData.data && germanData.data.products) {
    console.log(`Найдено ${germanData.data.products.length} товаров в Германии`);
    
    // Преобразовываем товары из API
    const mappedGermanProducts = mapProductsFromApi(germanData.data.products, {
      query,
      countries: ['de'],
      language: 'ru'
    });
    
    // Отбираем до 6 уникальных товаров из Германии (увеличено с 5)
    for (const product of mappedGermanProducts) {
      if (germanProducts.length >= 6) break;
      if (product.id && !displayedProductIds.has(product.id)) {
        germanProducts.push({ ...product, country: 'de' });
        displayedProductIds.add(product.id);
      }
    }
  } else {
    console.log('Не удалось найти товары в Германии или произошла ошибка');
  }
  
  // Шаг 2: Поиск товаров в других странах ЕС (до 30 товаров, чтобы в сумме было до 36)
  // Перемешиваем массив стран для случайного порядка, как в HTML-примере
  const shuffledEuCountries = shuffleArray([...OTHER_EU_COUNTRIES]);
  
  for (const countryCode of shuffledEuCountries) {
    if (otherEuProducts.length >= 30) break; // Останавливаемся, если нашли достаточно товаров
    
    console.log(`Поиск товаров в ${countryCode.toUpperCase()}...`);
    const countryData = await makeZylalabsCountryRequest(query, countryCode, page, 'ru');
    
    if (countryData && countryData.status === "OK" && countryData.data && countryData.data.products) {
      console.log(`Найдено ${countryData.data.products.length} товаров в ${countryCode.toUpperCase()}`);
      
      // Преобразовываем товары из API
      const mappedCountryProducts = mapProductsFromApi(countryData.data.products, {
        query,
        countries: [countryCode],
        language: 'ru'
      });
      
      // Отбираем уникальные товары из этой страны
      for (const product of mappedCountryProducts) {
        if (otherEuProducts.length >= 30) break; // Остановка, если достигли лимита
        if (product.id && !displayedProductIds.has(product.id)) {
          otherEuProducts.push({ ...product, country: countryCode });
          displayedProductIds.add(product.id);
        }
      }
    } else {
      console.log(`Не удалось найти товары в ${countryCode.toUpperCase()} или произошла ошибка`);
    }
  }
  
  // Объединяем все найденные товары
  const allDisplayProducts = [...germanProducts, ...otherEuProducts];
  console.log(`Всего найдено товаров: ${allDisplayProducts.length} (${germanProducts.length} из Германии, ${otherEuProducts.length} из других стран ЕС)`);
  
  // Возвращаем результаты поиска
  if (allDisplayProducts.length > 0) {
    // Обеспечиваем минимум 12 товаров
    if (allDisplayProducts.length < 12) {
      console.log(`Найдено менее 12 товаров (${allDisplayProducts.length}), дублируем некоторые товары для достижения минимума`);
      // Дублируем имеющиеся товары, чтобы достичь минимума в 12
      while (allDisplayProducts.length < 12 && germanProducts.length > 0) {
        const indexToDuplicate = allDisplayProducts.length % germanProducts.length;
        const duplicatedProduct = {...germanProducts[indexToDuplicate]};
        // Модифицируем ID, чтобы React не жаловался на дубликаты ключей
        duplicatedProduct.id = `${duplicatedProduct.id}-dup-${allDisplayProducts.length}`;
        allDisplayProducts.push(duplicatedProduct);
      }
    }
    
    return {
      products: allDisplayProducts,
      totalPages: Math.ceil(allDisplayProducts.length / 12), // 12 товаров на страницу
      isDemo: false,
      apiInfo: {
        totalGerman: germanProducts.length.toString(),
        totalOtherEu: otherEuProducts.length.toString(),
        totalProducts: allDisplayProducts.length.toString(),
        source: 'Zylalabs EU Search'
      }
    };
  } else {
    console.log('Не найдено товаров ни в одной из стран ЕС');
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
};
