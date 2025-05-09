
import { toast } from "@/components/ui/sonner";

/**
 * Generates mock search results for demonstration purposes
 * when the API is unavailable or when testing
 */
export const getMockSearchResults = (query: string) => {
  console.log('Используем мок-данные для запроса:', query);
  
  // Using more reliable image placeholders that work with CORS
  const getImageUrl = (text: string) => 
    `https://dummyimage.com/300x300/e3e3e3/333333&text=${encodeURIComponent(text)}`;
  
  // Базовые элементы для всех запросов
  const baseProducts = [
    {
      id: 'mock-1',
      title: 'Демонстрационный товар 1',
      subtitle: 'Тестовый товар для демонстрации функционала',
      price: '1999 руб.',
      currency: 'RUB',
      image: getImageUrl('Demo+1'),
      link: 'https://example.com/product1',
      rating: 4.5,
      source: 'Demo Shop',
      description: 'Это демонстрационный товар, созданный системой при недоступности API поиска.',
      availability: 'В наличии',
      brand: 'Demo Brand',
    },
    {
      id: 'mock-2',
      title: 'Демонстрационный товар 2',
      subtitle: 'Альтернативный тестовый товар',
      price: '3499 руб.',
      currency: 'RUB',
      image: getImageUrl('Demo+2'),
      link: 'https://example.com/product2',
      rating: 3.8,
      source: 'Example Store',
      description: 'Это второй демонстрационный товар для тестирования интерфейса.',
      availability: 'Под заказ',
      brand: 'Test Brand',
    },
  ];
  
  // Добавляем товар, связанный с запросом пользователя
  const queryRelatedProduct = {
    id: 'mock-query',
    title: `${query} - демонстрационный товар`,
    subtitle: `Товар, связанный с запросом "${query}"`,
    price: '2499 руб.',
    currency: 'RUB',
    image: getImageUrl(query),
    link: 'https://example.com/product-query',
    rating: 4.2,
    source: 'Search Demo',
    description: `Это демонстрационный товар, связанный с вашим запросом "${query}". Создан при недоступности API поиска.`,
    availability: 'Ограниченное количество',
    brand: query.split(' ')[0] || 'Query Brand',
  };
  
  // Уведомление пользователя о демонстрационном режиме
  toast.info('Используются демо-данные, так как API временно недоступен');
  
  return {
    products: [queryRelatedProduct, ...baseProducts],
    total: 3
  };
};
