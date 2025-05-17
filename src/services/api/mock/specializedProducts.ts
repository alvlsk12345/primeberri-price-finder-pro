
import { Product } from "@/services/types";

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
        _numericPrice: 599.99,
        specifications: {
          material: 'Шерсть, полиэстер',
          color: 'Черный',
          style: 'Деловой'
        }
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
        _numericPrice: 499.95,
        specifications: {
          material: 'Шерсть',
          color: 'Синий',
          style: 'Классический'
        }
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
        _numericPrice: 450.00,
        specifications: {
          material: 'Шерсть, эластан',
          color: 'Тёмно-серый',
          style: 'Slim fit'
        }
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
        _numericPrice: 299.99,
        specifications: {
          material: 'Хлопок, полиэстер',
          color: 'Черный',
          style: 'Повседневный'
        }
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
        _numericPrice: 359.90,
        specifications: {
          material: 'Шерсть, шёлк',
          color: 'Тёмно-синий',
          style: 'Деловой'
        }
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
        _numericPrice: 499.99,
        specifications: {
          material: 'Шерсть',
          color: 'Черный',
          style: 'Классический'
        }
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
        _numericPrice: 699.90,
        specifications: {
          material: 'Шерсть, шёлк',
          color: 'Тёмно-синий',
          style: 'Премиум'
        }
      }
    ];
  }
  
  return [];
};
