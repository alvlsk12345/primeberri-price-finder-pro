
import { toast } from "sonner";
import { Product } from "../types";
import { EUROPEAN_COUNTRIES } from "@/components/filter/CountryFilter";

/**
 * Генерирует демо-результаты поиска для демонстрации работы приложения
 * когда API недоступно или для тестирования интерфейса
 */
export const getMockSearchResults = (query: string) => {
  console.log('Используем демо-данные для запроса:', query);
  
  // Создаем базовый набор товаров из разных стран для демо-режима
  const baseProducts: Product[] = [
    // Немецкие товары (минимум 5)
    {
      id: 'mock-de-1',
      title: '[ДЕМО] Немецкий товар 1: ' + query,
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
      title: '[ДЕМО] Немецкий товар 2: ' + query,
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
      title: '[ДЕМО] Электроника из Германии: ' + query,
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
      title: '[ДЕМО] Товары из Берлина: ' + query,
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
      title: '[ДЕМО] Немецкая аптека: ' + query,
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
      title: '[ДЕМО] Английский товар: ' + query,
      subtitle: 'Великобритания',
      price: '35.99 £',
      currency: 'GBP',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=300&h=300',
      link: 'https://amazon.co.uk/product-gb',
      rating: 4.2,
      source: 'Amazon UK',
      description: 'Товар из Англии с доставкой по всему миру.',
      availability: 'Доступен',
      brand: 'British Goods',
      country: 'gb'
    },
    
    // Французский товар
    {
      id: 'mock-fr-1',
      title: '[ДЕМО] Французский товар: ' + query,
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
      title: '[ДЕМО] Итальянский товар: ' + query,
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
      title: '[ДЕМО] Испанский товар: ' + query,
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
  
  // Добавляем товар, точно связанный с запросом пользователя
  const queryRelatedProduct = {
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
  
  // Создаем итоговый список из минимум 10 товаров
  let demoProducts = [queryRelatedProduct, ...baseProducts];
  
  // Убеждаемся, что у нас есть товары из всех стран по фильтру европейских стран
  const countryProducts: {[key: string]: Product[]} = {};
  
  // Разделяем товары по странам
  EUROPEAN_COUNTRIES.forEach(country => {
    countryProducts[country.code] = demoProducts.filter(p => p.country === country.code);
  });
  
  // Гарантируем, что немецкие товары (приоритетные) идут в начале списка
  const germanProducts = countryProducts['de'] || [];
  const otherProducts = demoProducts.filter(p => p.country !== 'de');
  
  // Составляем финальный список с приоритетом германских товаров
  demoProducts = [...germanProducts, ...otherProducts];
  
  // Гарантируем минимум 10 результатов
  while (demoProducts.length < 10) {
    // Создаем дополнительные товары при необходимости
    const extraProduct = {
      id: `mock-extra-${demoProducts.length}`,
      title: `[ДЕМО] Дополнительный товар ${demoProducts.length}: ${query}`,
      subtitle: 'Германия',
      price: `${Math.floor(50 + Math.random() * 200)}.${Math.floor(Math.random() * 99)} €`,
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&h=300',
      link: `https://amazon.de/product-extra-${demoProducts.length}`,
      rating: Math.floor(30 + Math.random() * 20) / 10,
      source: 'Amazon.de',
      description: `Дополнительный товар для обеспечения минимального количества результатов поиска.`,
      availability: 'В наличии',
      brand: 'Extra Brand',
      country: 'de'
    };
    demoProducts.push(extraProduct);
  }
  
  toast.info('Демонстрационный режим: используются тестовые данные');
  
  return {
    products: demoProducts,
    total: demoProducts.length,
    isDemo: true
  };
};

/**
 * Функция для принудительного использования демо-режима
 * независимо от состояния API
 */
export const useDemoModeForced = true;
