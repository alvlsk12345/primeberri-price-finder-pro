
import { toast } from "sonner";
import { Product } from "../types";

/**
 * Генерирует демо-результаты поиска для демонстрации работы приложения
 * когда API недоступно или для тестирования интерфейса
 */
export const getMockSearchResults = (query: string) => {
  console.log('Используем демо-данные для запроса:', query);
  
  // Базовые товары для всех запросов
  const baseProducts: Product[] = [
    {
      id: 'mock-1',
      title: '[ДЕМО] Демонстрационный товар 1',
      subtitle: 'Европа',
      price: '1999 руб.',
      currency: 'RUB',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300',
      link: 'https://example.com/product1',
      rating: 4.5,
      source: 'Demo Shop',
      description: 'Это демонстрационный товар, созданный системой для тестирования интерфейса.',
      availability: 'В наличии',
      brand: 'Demo Brand',
    },
    {
      id: 'mock-2',
      title: '[ДЕМО] Демонстрационный товар 2',
      subtitle: 'Англия',
      price: '3499 руб.',
      currency: 'RUB',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=300&h=300',
      link: 'https://example.com/product2',
      rating: 3.8,
      source: 'Example Store',
      description: 'Это второй демонстрационный товар для тестирования интерфейса.',
      availability: 'Под заказ',
      brand: 'Test Brand',
    },
    {
      id: 'mock-3',
      title: '[ДЕМО] Электроника',
      subtitle: 'США',
      price: '5999 руб.',
      currency: 'RUB',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=300',
      link: 'https://example.com/product3',
      rating: 4.2,
      source: 'Tech Store',
      description: 'Демонстрационный товар из категории электроники.',
      availability: 'В наличии: 3 шт.',
      brand: 'TechDemo',
    },
  ];
  
  // Добавляем товар, связанный с запросом пользователя
  const queryRelatedProduct = {
    id: 'mock-query',
    title: `[ДЕМО] ${query} - демо-товар`,
    subtitle: `США`,
    price: '2499 руб.',
    currency: 'RUB',
    image: `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=300&h=300`,
    link: 'https://example.com/product-query',
    rating: 4.2,
    source: 'Search Demo',
    description: `Это демонстрационный товар, созданный на основе вашего запроса "${query}".`,
    availability: 'Ограниченное количество',
    brand: query.split(' ')[0] || 'Query Brand',
  };
  
  toast.info('Демонстрационный режим: используются тестовые данные');
  
  return {
    products: [queryRelatedProduct, ...baseProducts],
    total: 4,
    isDemo: true
  };
};

/**
 * Функция для принудительного использования демо-режима
 * независимо от состояния API
 */
export const useDemoModeForced = true;

