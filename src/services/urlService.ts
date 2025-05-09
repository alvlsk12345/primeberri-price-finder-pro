
import { Product, StoreMap } from './types';

// Карта реальных доменов магазинов
const storeMap: StoreMap = {
  'Amazon': 'amazon.com',
  'eBay': 'ebay.com',
  'Zalando': 'zalando.eu',
  'ASOS': 'asos.com',
  'JD Sports': 'jdsports.com',
  'Nike Store': 'nike.com',
  'Nike.com': 'nike.com',
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
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, ''); // Удаляем тире в начале и конце
};

// Функция для получения идентификатора продукта из ссылки
export const extractProductId = (link: string, fallbackId: string): string => {
  // Пытаемся найти ID в соответствии с разными форматами ссылок
  const patterns = [
    /\/([A-Za-z0-9]{10})\/?(\?|$)/, // Amazon ASIN
    /-([A-Za-z0-9]{7,12})\.html/, // Nike/Zalando
    /\/([A-Za-z0-9]{9,15})$/, // eBay
    /p\/([A-Za-z0-9-]{5,20})$/ // Другие магазины
  ];
  
  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return fallbackId; // Используем fallbackId, если не удалось извлечь ID
};

// Обновляем функцию для получения реальной ссылки на страницу товара
export const getProductLink = (product: Product): string => {
  // Если у продукта есть валидная ссылка, используем её
  if (product.link && product.link.startsWith('http') && !product.link.includes('undefined')) {
    return product.link;
  }
  
  // Определяем домен магазина или используем запасной вариант
  const domain = getStoreDomain(product.source);
  
  // Получаем ID продукта либо из уже имеющейся ссылки, либо из ID продукта
  const productId = product.link ? 
    extractProductId(product.link, product.id) : 
    product.id;
  
  // Создаем слаг для URL из имени продукта
  const productSlug = createProductSlug(product.title);
  
  // Формируем URL с правильными параметрами в зависимости от магазина
  if (domain === 'amazon.com') {
    return `https://${domain}/dp/${productId}`;
  } else if (domain === 'ebay.com') {
    return `https://${domain}/itm/${productId}`;
  } else if (domain === 'nike.com') {
    // Для Nike используем специальный формат
    return `https://${domain}/t/${productSlug}/${productId}.html`;
  } else if (domain === 'zalando.eu') {
    // Для Zalando
    return `https://${domain}/item/${productSlug}-${productId}.html`;
  } else {
    // Для других магазинов используем стандартный формат
    return `https://${domain}/product/${productSlug}-${productId}`;
  }
};
