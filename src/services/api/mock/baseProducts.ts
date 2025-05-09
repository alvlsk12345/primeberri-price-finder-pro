
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
