import { Product } from "@/services/types";

/**
 * Генерирует список товаров для определенной страницы
 */
export const generateProductsForPage = (
  query: string, 
  page: number, 
  allDemoProducts: Product[],
  createPageSpecificProducts: (query: string, page: number, count?: number) => Product[]
): Product[] => {
  const itemsPerPage = 36;
  
  // Общее количество продуктов
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
