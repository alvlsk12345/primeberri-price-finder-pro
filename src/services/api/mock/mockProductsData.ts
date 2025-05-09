import { Product } from "@/services/types";

/**
 * Базовый набор товаров из разных стран для демо-режима
 */
export const getBaseProducts = (): Product[] => {
  return [
    // Немецкие товары (минимум 5)
    {
      id: 'mock-de-1',
      title: '[ДЕМО] Немецкий товар 1',
      subtitle: 'Германия',
      price: '199.99 €',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300',
      link: 'https://amazon.de/product1',
      rating: 4.7,
      source: 'Amazon.de',
      description: 'Качественный немецкий товар с быстрой доставкой в Россию.',
      availability: 'В наличии',
      brand: 'Deutsche Quality',
      country: 'de'
    },
    {
      id: 'mock-de-2',
      title: '[ДЕМО] Немецкий товар 2',
      subtitle: 'Германия',
      price: '149.95 €',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&h=300',
      link: 'https://otto.de/product2',
      rating: 4.3,
      source: 'Otto.de',
      description: 'Немецкое качество по доступной цене. Доставка из Германии.',
      availability: 'Под заказ: 3-5 дней',
      brand: 'OTTO Brand',
      country: 'de'
    },
    {
      id: 'mock-de-3',
      title: '[ДЕМО] Электроника из Германии',
      subtitle: 'Германия',
      price: '299.00 €',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=300&h=300',
      link: 'https://zalando.de/product3',
      rating: 4.5,
      source: 'Zalando.de',
      description: 'Высококачественная электроника напрямую из Германии.',
      availability: 'В наличии: 10+ шт.',
      brand: 'ElectroDE',
      country: 'de'
    },
    {
      id: 'mock-de-4',
      title: '[ДЕМО] Товары из Берлина',
      subtitle: 'Германия',
      price: '89.99 €',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&h=300',
      link: 'https://idealo.de/product4',
      rating: 4.0,
      source: 'Idealo.de',
      description: 'Берлинский магазин, доставка по всей Европе.',
      availability: 'В наличии',
      brand: 'Berlin Store',
      country: 'de'
    },
    {
      id: 'mock-de-5',
      title: '[ДЕМО] Немецкая аптека',
      subtitle: 'Германия',
      price: '45.50 €',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&h=300',
      link: 'https://medikamente-per-klick.de/product5',
      rating: 4.9,
      source: 'Medikamente-per-klick.de',
      description: 'Немецкие аптечные товары с быстрой доставкой.',
      availability: '3 шт. в наличии',
      brand: 'Deutsche Apotheke',
      country: 'de'
    },
    
    // Английские товары
    {
      id: 'mock-gb-1',
      title: '[ДЕМО] Английский товар',
      subtitle: 'Великобритания',
      price: '35.99 £',
      currency: 'GBP',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=300&h=300',
      link: 'https://amazon.co.uk/product-gb',
      rating: 4.2,
      source: 'Amazon UK',
      description: 'Товар из ��нглии с доставкой по всему миру.',
      availability: 'Доступен',
      brand: 'British Goods',
      country: 'gb'
    },
    
    // Французский товар
    {
      id: 'mock-fr-1',
      title: '[ДЕМО] Французский товар',
      subtitle: 'Франция',
      price: '129.90 €',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&h=300',
      link: 'https://amazon.fr/product-fr',
      rating: 3.9,
      source: 'Amazon France',
      description: 'Аутентичные французские товары с доставкой в Россию.',
      availability: 'Под заказ',
      brand: 'Paris Fashion',
      country: 'fr'
    },
    
    // Итальянский товар
    {
      id: 'mock-it-1',
      title: '[ДЕМО] Итальянский товар',
      subtitle: 'Италия',
      price: '79.95 €',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?auto=format&fit=crop&w=300&h=300',
      link: 'https://amazon.it/product-it',
      rating: 4.6,
      source: 'Amazon Italy',
      description: 'Товар из Италии высокого качества.',
      availability: 'Ограниченное количество',
      brand: 'Milano Style',
      country: 'it'
    },
    
    // Испанский товар
    {
      id: 'mock-es-1',
      title: '[ДЕМО] Испанский товар',
      subtitle: 'Испания',
      price: '59.50 €',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&h=300',
      link: 'https://amazon.es/product-es',
      rating: 4.1,
      source: 'Amazon Spain',
      description: 'Товар из Испании с доставкой в Россию.',
      availability: 'В наличии',
      brand: 'Barcelona',
      country: 'es'
    },
  ];
};

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
    country: 'de'
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
    country: 'de'
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
      country: i % 3 === 0 ? 'de' : (i % 3 === 1 ? 'gb' : 'fr')
    });
  }
  
  return products;
};

/**
 * Возвращает специальные товары для конкретных запросов
 */
export const getSpecificProducts = (query: string): Product[] => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Запросы связанные с одеждой Hugo Boss
  if (normalizedQuery.includes('hugo boss') || 
      (normalizedQuery.includes('hugo') && normalizedQuery.includes('boss')) ||
      (normalizedQuery.includes('пиджак') && normalizedQuery.includes('boss')) ||
      (normalizedQuery.includes('jacket') && normalizedQuery.includes('hugo'))) {
    
    return [
      {
        id: 'special-hugo-boss-1',
        title: 'Hugo Boss Premium Jacket',
        subtitle: 'Германия',
        price: '599.99 €',
        currency: 'EUR',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=300&h=300',
        link: 'https://amazon.de/hugo-boss-jacket',
        rating: 4.9,
        source: 'Amazon.de',
        description: 'Премиальный пиджак Hugo Boss из коллекции 2024 года. Элегантный дизайн и безупречное качество.',
        availability: 'В наличии',
        brand: 'Hugo Boss',
        country: 'de',
        _numericPrice: 599.99
      },
      {
        id: 'special-hugo-boss-2',
        title: 'Пиджак Hugo Boss Classic',
        subtitle: 'Германия',
        price: '499.95 €',
        currency: 'EUR',
        image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=300&h=300',
        link: 'https://zalando.de/hugo-boss-classic',
        rating: 4.8,
        source: 'Zalando.de',
        description: 'Классический пиджак Hugo Boss. Идеально подходит для деловых встреч и официальных мероприятий.',
        availability: 'Доступно 3 шт.',
        brand: 'Hugo Boss',
        country: 'de',
        _numericPrice: 499.95
      },
      {
        id: 'special-hugo-boss-3',
        title: 'Hugo Boss Slim Fit Jacket',
        subtitle: 'Великобритания',
        price: '450.00 £',
        currency: 'GBP',
        image: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=300&h=300',
        link: 'https://hugoboss.com/uk/slim-fit',
        rating: 4.7,
        source: 'Hugo Boss UK',
        description: 'Пиджак Hugo Boss облегающего кроя. Современный дизайн и отличная посадка.',
        availability: 'В наличии',
        brand: 'Hugo Boss',
        country: 'gb',
        _numericPrice: 450.00
      }
    ];
  }
  
  // Запросы связанные с пиджаками
  if (normalizedQuery.includes('пиджак') || normalizedQuery.includes('jacket')) {
    return [
      {
        id: 'special-jacket-1',
        title: 'Premium Men\'s Jacket',
        subtitle: 'Германия',
        price: '299.99 €',
        currency: 'EUR',
        image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=300&h=300',
        link: 'https://otto.de/premium-jacket',
        rating: 4.6,
        source: 'Otto.de',
        description: 'Высококачественный мужской пиджак от ведущего немецкого бренда.',
        availability: 'В наличии',
        brand: 'Premium Brand',
        country: 'de',
        _numericPrice: 299.99
      },
      {
        id: 'special-jacket-2',
        title: 'Деловой пиджак классического кроя',
        subtitle: 'Италия',
        price: '359.90 €',
        currency: 'EUR',
        image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=300&h=300',
        link: 'https://amazon.it/business-jacket',
        rating: 4.7,
        source: 'Amazon Italy',
        description: 'Итальянский деловой пиджак с безупречным кроем и вниманием к деталям.',
        availability: 'Доступно',
        brand: 'Milano Fashion',
        country: 'it',
        _numericPrice: 359.90
      }
    ];
  }
  
  // Запросы связанные с костюмами
  if (normalizedQuery.includes('костюм') || normalizedQuery.includes('suit')) {
    return [
      {
        id: 'special-suit-1',
        title: 'Классический деловой костюм',
        subtitle: 'Германия',
        price: '499.99 €',
        currency: 'EUR',
        image: 'https://images.unsplash.com/photo-1598808503746-f34faeb4bc61?auto=format&fit=crop&w=300&h=300',
        link: 'https://zalando.de/business-suit',
        rating: 4.8,
        source: 'Zalando.de',
        description: 'Классический костюм для деловых встреч и официальных мероприятий.',
        availability: 'В наличии',
        brand: 'German Quality',
        country: 'de',
        _numericPrice: 499.99
      },
      {
        id: 'special-suit-2',
        title: 'Premium Men\'s Suit',
        subtitle: 'Франция',
        price: '699.90 €',
        currency: 'EUR',
        image: 'https://images.unsplash.com/photo-1593032534613-075fcf1482ad?auto=format&fit=crop&w=300&h=300',
        link: 'https://amazon.fr/premium-suit',
        rating: 4.9,
        source: 'Amazon France',
        description: 'Премиальный мужской костюм от известного французского дизайнера.',
        availability: 'Под заказ (2-3 дня)',
        brand: 'Paris Fashion',
        country: 'fr',
        _numericPrice: 699.90
      }
    ];
  }
  
  return [];
};
