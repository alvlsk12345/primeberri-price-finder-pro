
import { Product } from "@/services/types";

// Список особых ключевых слов для поиска
export const SPECIAL_QUERIES = [
  'hugo', 'boss', 'пиджак', 'jacket', 'костюм', 'suit', 
  'brand', 'premium', 'luxury', 'fashion'
];

/**
 * Проверяет, содержит ли запрос хотя бы одно из ключевых слов
 */
export const matchesKeywords = (query: string, keywords: string[]): boolean => {
  const normalizedQuery = query.toLowerCase().trim();
  return keywords.some(keyword => normalizedQuery.includes(keyword.toLowerCase()));
};

/**
 * Генерирует список товаров Hugo Boss для соответствующих запросов
 */
export const generateHugoBossProducts = (query: string): Product[] => {
  // Базовые цены для товаров Hugo Boss
  const prices = [349.99, 399.95, 299.90, 449.00, 499.99];
  
  // Генерируем 3-5 товаров Hugo Boss
  const count = 3 + Math.floor(Math.random() * 3); // от 3 до 5 товаров
  const products: Product[] = [];
  
  for (let i = 0; i < count; i++) {
    const price = prices[i % prices.length];
    const isJacket = query.toLowerCase().includes('пиджак') || 
                     query.toLowerCase().includes('jacket');
    
    const isSuit = query.toLowerCase().includes('костюм') || 
                  query.toLowerCase().includes('suit');
    
    // Определяем тип товара на основе запроса
    const type = isJacket ? 'Пиджак' : (isSuit ? 'Костюм' : 'Одежда');
    
    products.push({
      id: `hugo-boss-${i}`,
      title: `Hugo Boss ${type} ${i + 1}`,
      subtitle: 'Германия',
      price: `${price} €`,
      currency: 'EUR',
      image: `https://images.unsplash.com/photo-${1550000000 + i * 1000}?auto=format&fit=crop&w=300&h=300`,
      link: `https://hugo-boss.com/product-${i}`,
      rating: 4.5 + (Math.random() * 0.5),
      source: 'Hugo Boss Official',
      description: `Оригинальный ${type.toLowerCase()} Hugo Boss. Высокое качество материалов и пошива.`,
      availability: 'В наличии',
      brand: 'Hugo Boss',
      country: 'de',
      specifications: {
        type: type,
        material: 'Премиальные материалы',
        features: ['Оригинал', 'Премиум-класс', 'Немецкий бренд']
      },
      _numericPrice: price
    });
  }
  
  return products;
};
