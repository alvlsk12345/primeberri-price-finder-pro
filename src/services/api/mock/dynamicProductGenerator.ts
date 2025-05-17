
import { Product } from "@/services/types";

/**
 * Создает специальный товар, связанный с запросом пользователя
 */
export const createQueryRelatedProduct = (query: string): Product => {
  return {
    id: 'mock-query',
    title: `[ДЕМО] ${query} - специальный товар`,
    subtitle: `Германия`,
    price: '249.99 €',
    currency: 'EUR',
    image: `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=300&h=300`,
    link: 'https://amazon.de/product-special',
    rating: 5.0,
    source: 'Amazon.de',
    description: `Это специальный демо-товар, созданный на основе вашего запроса "${query}".`,
    availability: 'Ограниченное количество - 5 шт.',
    brand: query.split(' ')[0] || 'SpecialBrand',
    country: 'de',
    specifications: {}
  };
};

/**
 * Создает дополнительный товар для достижения минимального количества результатов
 */
export const createExtraProduct = (query: string, index: number): Product => {
  return {
    id: `mock-extra-${index}`,
    title: `[ДЕМО] Дополнительный товар ${index}: ${query}`,
    subtitle: 'Германия',
    price: `${Math.floor(50 + Math.random() * 200)}.${Math.floor(Math.random() * 99)} €`,
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&h=300',
    link: `https://amazon.de/product-extra-${index}`,
    rating: Math.floor(30 + Math.random() * 20) / 10,
    source: 'Amazon.de',
    description: `Дополнительный товар для обеспечения минимального количества результатов поиска.`,
    availability: 'В наличии',
    brand: 'Extra Brand',
    country: 'de',
    specifications: {}
  };
};

/**
 * Создает товары для специфических страниц (при необходимости)
 */
export const createPageSpecificProducts = (query: string, page: number, count: number = 3): Product[] => {
  const products: Product[] = [];
  
  for (let i = 0; i < count; i++) {
    products.push({
      id: `mock-page-${page}-item-${i}`,
      title: `[ДЕМО] Страница ${page}, товар ${i + 1}: ${query}`,
      subtitle: 'Германия',
      price: `${Math.floor(50 + Math.random() * 200)}.${Math.floor(Math.random() * 99)} €`,
      currency: 'EUR',
      image: `https://images.unsplash.com/photo-${1570000000 + (page * 1000) + i}?auto=format&fit=crop&w=300&h=300`,
      link: `https://amazon.de/product-page-${page}-${i}`,
      rating: Math.floor(30 + Math.random() * 20) / 10,
      source: 'Amazon.de',
      description: `Товар со страницы ${page}. Дополнительное описание для запроса "${query}".`,
      availability: 'В наличии',
      brand: `Brand ${page}.${i}`,
      country: i % 3 === 0 ? 'de' : (i % 3 === 1 ? 'gb' : 'fr'),
      specifications: {}
    });
  }
  
  return products;
};

/**
 * Обогащает заголовки товаров поисковым запросом
 */
export const enrichProductTitlesWithQuery = (products: Product[], query: string): Product[] => {
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
