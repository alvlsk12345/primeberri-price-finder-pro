
import { Product, ProductFilters } from "@/services/types";
import { EUROPEAN_COUNTRIES } from "@/components/filter/CountryFilter";
import { 
  getBaseProducts, 
  createQueryRelatedProduct, 
  createExtraProduct,
  createPageSpecificProducts 
} from "./mockProductsData";
import { toast } from "sonner";

/**
 * Обогащает заголовки товаров поисковым запросом
 */
const enrichProductTitlesWithQuery = (products: Product[], query: string): Product[] => {
  return products.map(product => {
    // Если заголовок не содержит поисковый запрос, добавляем его
    if (!product.title.toLowerCase().includes(query.toLowerCase())) {
      const baseTitle = product.title.split(':')[0]; // Берем часть до двоеточия, если оно есть
      return {
        ...product,
        title: `${baseTitle}: ${query}`
      };
    }
    return product;
  });
};

/**
 * Генерирует список товаров для определенной страницы
 */
export const generateProductsForPage = (
  query: string, 
  page: number, 
  allDemoProducts: Product[]
): Product[] => {
  const itemsPerPage = 9;
  
  // Общее количество продуктов - 10 (9 на первой странице, 1 на второй)
  const totalItems = 10;

  if (page === 1) {
    // На первой странице показываем первые 9 товаров
    return allDemoProducts.slice(0, 9);
  } else if (page === 2) {
    // На второй странице показываем оставшийся 1 товар
    return allDemoProducts.slice(9, 10);
  } else {
    // Для других страниц (если такие запросы будут) создаем уникальные товары
    return createPageSpecificProducts(query, page);
  }
};

/**
 * Генерирует демо-результаты поиска для демонстрации работы приложения
 * когда API недоступно или для тестирования интерфейса
 */
export const generateMockSearchResults = (query: string, page: number = 1) => {
  console.log('Используем демо-данные для запроса:', query, 'страница:', page);
  
  // Получаем базовый набор товаров
  let baseProducts = getBaseProducts();
  
  // Добавляем товар, точно связанный с запросом пользователя
  const queryRelatedProduct = createQueryRelatedProduct(query);
  
  // Обогащаем заголовки товаров поисковым запросом
  baseProducts = enrichProductTitlesWithQuery(baseProducts, query);
  
  // Создаем итоговый список из минимум 10 товаров
  let allDemoProducts = [queryRelatedProduct, ...baseProducts];
  
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
  while (allDemoProducts.length < 10) {
    // Создаем дополнительные товары при необходимости
    const extraProduct = createExtraProduct(query, allDemoProducts.length);
    allDemoProducts.push(extraProduct);
  }
  
  // Пример с 10 товарами: 9 на первой странице и 1 на второй странице
  const totalItems = 10;
  const itemsPerPage = 9;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Определяем, какие товары должны быть показаны на текущей странице
  const demoProducts = generateProductsForPage(query, page, allDemoProducts);

  console.log(`Страница ${page}: возвращаем ${demoProducts.length} из ${totalItems} товаров`);
  
  toast.info('Демонстрационный режим: используются тестовые данные');
  
  return {
    products: demoProducts,
    total: totalItems,
    totalPages: totalPages,
    isDemo: true
  };
};
