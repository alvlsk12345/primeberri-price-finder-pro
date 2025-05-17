
import { Product } from "@/services/types";
import { EUROPEAN_COUNTRIES } from "@/components/filter/CountryFilter";
import { 
  getBaseProducts, 
  getSpecificProducts,
  createQueryRelatedProduct, 
  createExtraProduct,
  createPageSpecificProducts,
  enrichProductTitlesWithQuery
} from "./mockProductsData";
import { SPECIAL_QUERIES, matchesKeywords, generateHugoBossProducts } from "./queryHelpers";
import { generateProductsForPage } from "./paginationHelper";
import { toast } from "sonner";

/**
 * Генерирует демо-результаты поиска для демонстрации работы приложения
 * когда API недоступно или для тестирования интерфейса
 */
export const generateMockSearchResults = (query: string, page: number = 1) => {
  console.log('Используем демо-данные для запроса:', query, 'страница:', page);
  
  // Нормализуем запрос для проверки ключевых слов
  const normalizedQuery = query.toLowerCase().trim();
  
  // Проверяем, содержит ли запрос особые ключевые слова
  const isSpecialQuery = SPECIAL_QUERIES.some(keyword => normalizedQuery.includes(keyword));
  
  // Получаем базовый набор товаров
  let baseProducts = getBaseProducts();
  
  // Если запрос особый, добавляем специальные товары
  if (isSpecialQuery) {
    // Получаем специальные товары для запроса
    const specificProducts = getSpecificProducts(query);
    if (specificProducts && specificProducts.length > 0) {
      baseProducts = [...specificProducts, ...baseProducts];
    }
  }
  
  // Добавляем товар, точно связанный с запросом пользователя
  const queryRelatedProduct = createQueryRelatedProduct(query);
  
  // Обогащаем заголовки товаров поисковым запросом
  baseProducts = enrichProductTitlesWithQuery(baseProducts, query);
  
  // Создаем итоговый список из минимум 10 товаров
  // Убедимся, что все товары соответствуют типу Product
  let allDemoProducts: Product[] = [queryRelatedProduct, ...baseProducts];
  
  // Если запрос про Hugo Boss или пиджаки, добавляем больше релевантных товаров
  if (matchesKeywords(query, ['hugo', 'boss', 'пиджак', 'jacket', 'костюм', 'suit'])) {
    // Добавляем товары Hugo Boss в начало списка
    const hugoProducts = generateHugoBossProducts(query);
    allDemoProducts = [...hugoProducts, ...allDemoProducts];
  }
  
  // Убеждаемся, что у нас есть товары из всех стран по фильтру европейских стран
  const countryProducts: {[key: string]: Product[]} = {};
  
  // Разделяем товары по странам
  EUROPEAN_COUNTRIES.forEach(country => {
    countryProducts[country.code] = allDemoProducts.filter(p => p.country === country.code);
  });
  
  // Гарантируем, что немецкие товары (приоритетные) идут в начале списка
  const germanProducts = countryProducts['de'] || [];
  const otherProducts = allDemoProducts.filter(p => p.country !== 'de');
  
  // Составляем финальный список с приоритетом германских товаров
  allDemoProducts = [...germanProducts, ...otherProducts];
  
  // Гарантируем минимум 10 результатов
  while (allDemoProducts.length < 12) {
    // Создаем дополнительные товары при необходимости
    const extraProduct = createExtraProduct(query, allDemoProducts.length);
    allDemoProducts.push(extraProduct);
  }
  
  // Расчет общего количества страниц (минимум 2, чтобы всегда была пагинация)
  const itemsPerPage = 9;
  const totalItems = allDemoProducts.length;
  const totalPages = Math.max(2, Math.ceil(totalItems / itemsPerPage));
  
  // Определяем, какие товары должны быть показаны на текущей странице
  const demoProducts = generateProductsForPage(query, page, allDemoProducts, createPageSpecificProducts);

  console.log(`Страница ${page}: возвращаем ${demoProducts.length} из ${totalItems} товаров`);
  
  toast.info('Демонстрационный режим: используются тестовые данные');
  
  return {
    products: demoProducts,
    total: totalItems,
    totalPages: totalPages,
    isDemo: true
  };
};
