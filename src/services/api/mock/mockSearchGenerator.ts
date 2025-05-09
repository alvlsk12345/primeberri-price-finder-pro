
import { Product, ProductFilters } from "@/services/types";
import { EUROPEAN_COUNTRIES } from "@/components/filter/CountryFilter";
import { 
  getBaseProducts, 
  createQueryRelatedProduct, 
  createExtraProduct,
  createPageSpecificProducts,
  getSpecificProducts
} from "./mockProductsData";
import { toast } from "sonner";

// Список запросов, для которых нужно улучшенное создание товаров
const SPECIAL_QUERIES = ['hugo boss', 'пиджак', 'jacket', 'suit', 'костюм', 'boss'];

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
 * Проверяет, соответствует ли запрос определенным ключевым словам
 */
const matchesKeywords = (query: string, keywords: string[]): boolean => {
  const lowerQuery = query.toLowerCase();
  return keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
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
  const totalItems = allDemoProducts.length;
  
  // Расчет начального и конечного индексов для текущей страницы
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  // Если индексы выходят за пределы массива, возвращаем специальные товары для страницы
  if (startIndex >= totalItems) {
    return createPageSpecificProducts(query, page);
  }

  // Возвращаем часть товаров для текущей страницы
  return allDemoProducts.slice(startIndex, endIndex);
};

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
  let allDemoProducts = [queryRelatedProduct, ...baseProducts];
  
  // Если запрос про Hugo Boss или пиджаки, добавляем больше релевантных товаров
  if (matchesKeywords(query, ['hugo', 'boss', 'пиджак', 'jacket', 'костюм', 'suit'])) {
    // Добавляем товары Hugo Boss в начало списка
    const hugoProducts = [
      {
        id: 'hugo-boss-1',
        title: `[ДЕМО] Hugo Boss ${query.includes('пиджак') ? 'пиджак' : 'jacket'} Premium`,
        subtitle: 'Германия',
        price: '549.99 €',
        currency: 'EUR',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&h=300',
        link: 'https://hugoboss.com/product1',
        rating: 4.8,
        source: 'Hugo Boss Official',
        description: 'Премиальный пиджак Hugo Boss из осенней коллекции. Элегантный дизайн, идеальная посадка.',
        availability: 'В наличии',
        brand: 'Hugo Boss',
        country: 'de',
        _numericPrice: 549.99
      },
      {
        id: 'hugo-boss-2',
        title: `[ДЕМО] Hugo Boss ${query.includes('костюм') ? 'костюм' : 'suit'} Classic`,
        subtitle: 'Германия',
        price: '799.95 €',
        currency: 'EUR',
        image: 'https://images.unsplash.com/photo-1598808503746-f34faeb4bc61?auto=format&fit=crop&w=300&h=300',
        link: 'https://hugoboss.com/product2',
        rating: 4.9,
        source: 'Hugo Boss Official',
        description: 'Классический костюм Hugo Boss. Идеальный выбор для деловых встреч и особых случаев.',
        availability: 'Под заказ: 2-3 дня',
        brand: 'Hugo Boss',
        country: 'de',
        _numericPrice: 799.95
      }
    ];
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
