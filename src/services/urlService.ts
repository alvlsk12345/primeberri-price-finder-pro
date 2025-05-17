
import { Product, StoreMap } from './types';

// Карта реальных доменов магазинов
const storeMap: StoreMap = {
  'Amazon': 'amazon.de',
  'Amazon.de': 'amazon.de',
  'ebay': 'ebay.de',
  'eBay': 'ebay.de',
  'Zalando': 'zalando.de',
  'ASOS': 'asos.de',
  'JD Sports': 'jdsports.de',
  'Nike': 'nike.com',
  'Nike Store': 'nike.com',
  'Nike.com': 'nike.com',
  'Foot Locker': 'footlocker.de',
  'Adidas': 'adidas.de',
  'H&M': 'hm.com',
  'Zara': 'zara.com',
  'Sportisimo': 'sportisimo.de',
  'Otto': 'otto.de',
  'Otto.de': 'otto.de',
  'MediaMarkt': 'mediamarkt.de',
  'MediaMarkt.de': 'mediamarkt.de',
  'Saturn': 'saturn.de',
  'Saturn.de': 'saturn.de',
  'Unisportstore': 'unisportstore.de',
  'Интернет-магазин': 'shop.example.com'
};

// Функция для получения доменного имени магазина
export const getStoreDomain = (storeName: string): string => {
  // Проверяем, есть ли имя магазина в нашем словаре
  if (storeName && storeMap[storeName]) {
    return storeMap[storeName];
  }
  
  // Если имя магазина содержит точку, возможно, это уже домен
  if (storeName && storeName.includes('.')) {
    return storeName;
  }
  
  return 'shop.example.com';
};

// Функция для получения кода страны из домена
export const getCountryCodeFromDomain = (domain: string): string => {
  if (!domain) return '';
  
  const domainLC = domain.toLowerCase();
  
  if (domainLC.endsWith('.de') || domainLC.includes('amazon.de')) return 'DE';
  if (domainLC.endsWith('.uk') || domainLC.includes('amazon.co.uk')) return 'GB';
  if (domainLC.endsWith('.fr') || domainLC.includes('amazon.fr')) return 'FR';
  if (domainLC.endsWith('.it') || domainLC.includes('amazon.it')) return 'IT';
  if (domainLC.endsWith('.es') || domainLC.includes('amazon.es')) return 'ES';
  if (domainLC.endsWith('.nl')) return 'NL';
  if (domainLC.endsWith('.pl')) return 'PL';
  if (domainLC.endsWith('.at')) return 'AT';
  if (domainLC.endsWith('.ch')) return 'CH';
  
  return '';
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
  // Если у продукта есть валидная прямая ссылка на магазин, используем её
  if (product.link && 
      product.link.startsWith('http') && 
      !product.link.includes('undefined') &&
      !product.link.includes('google.com/shopping') &&
      !product.link.includes('shopping.google')) {
    console.log(`getProductLink: Использую прямую ссылку на магазин: ${product.link.substring(0, 100)}`);
    return product.link;
  }
  
  // Определяем домен магазина или используем запасной вариант
  const domain = getStoreDomain(product.source);
  console.log(`getProductLink: Использую домен ${domain} для магазина ${product.source}`);
  
  // Определяем страну на основе домена, если она не указана в продукте
  if (!product.country) {
    const countryFromDomain = getCountryCodeFromDomain(domain);
    if (countryFromDomain) {
      console.log(`getProductLink: Определена страна ${countryFromDomain} из домена ${domain}`);
      product.country = countryFromDomain;
    }
  }
  
  // Получаем ID продукта либо из уже имеющейся ссылки, либо из ID продукта
  const productId = product.link ? 
    extractProductId(product.link, product.id) : 
    product.id;
  
  // Создаем слаг для URL из имени продукта
  const productSlug = createProductSlug(product.title);
  
  // Формируем URL с правильными параметрами в зависимости от магазина
  if (domain.includes('amazon')) {
    return `https://${domain}/dp/${productId}`;
  } else if (domain.includes('ebay')) {
    return `https://${domain}/itm/${productId}`;
  } else if (domain.includes('nike')) {
    // Для Nike используем специальный формат
    return `https://${domain}/t/${productSlug}/${productId}.html`;
  } else if (domain.includes('zalando')) {
    // Для Zalando
    return `https://${domain}/item/${productSlug}-${productId}.html`;
  } else if (domain.includes('otto')) {
    // Для Otto.de
    return `https://${domain}/p/${productSlug}/${productId}`;
  } else if (domain.includes('mediamarkt') || domain.includes('saturn')) {
    // Для MediaMarkt и Saturn
    return `https://${domain}/de/product/_${productSlug}-${productId}.html`;
  } else {
    // Для других магазинов используем стандартный формат
    return `https://${domain}/product/${productSlug}-${productId}`;
  }
};
