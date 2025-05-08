
import { Product, StoreMap } from './types';

// Карта реальных доменов магазинов
const storeMap: StoreMap = {
  'Amazon': 'amazon.com',
  'eBay': 'ebay.com',
  'Zalando': 'zalando.eu',
  'ASOS': 'asos.com',
  'JD Sports': 'jdsports.com',
  'Nike Store': 'nike.com',
  'Foot Locker': 'footlocker.eu',
  'Adidas': 'adidas.com',
  'H&M': 'hm.com',
  'Zara': 'zara.com',
  'Sportisimo': 'sportisimo.eu',
  'Интернет-магазин': 'shop.example.com'
};

// Функция для получения доменного имени магазина
export const getStoreDomain = (storeName: string): string => {
  return storeMap[storeName] || 'shop.example.com';
};

// Функция для создания слага из имени продукта
export const createProductSlug = (name: string): string => {
  return name.toLowerCase()
    .replace(/[^a-zа-яё0-9]/g, '-')
    .replace(/-+/g, '-');
};

// Обновляем функцию для получения реальной ссылки на страницу товара
export const getProductLink = (product: Product): string => {
  // Определяем домен магазина или используем запасной вариант
  const domain = getStoreDomain(product.source);
  
  // Создаем слаг для URL из имени продукта
  const productSlug = createProductSlug(product.title);
  
  // Формируем URL с правильными параметрами в зависимости от магазина
  if (domain === 'amazon.com') {
    return `https://${domain}/dp/${product.id}`;
  } else if (domain === 'ebay.com') {
    return `https://${domain}/itm/${product.id}`;
  } else if (domain === 'nike.com') {
    // Для Nike используем специальный формат
    return `https://${domain}/t/${productSlug}/${product.id}.html`;
  } else if (domain === 'zalando.eu') {
    // Для Zalando
    return `https://${domain}/item/${productSlug}-${product.id}.html`;
  } else {
    // Для других магазинов используем стандартный формат
    return `https://${domain}/product/${productSlug}-${product.id}`;
  }
};
