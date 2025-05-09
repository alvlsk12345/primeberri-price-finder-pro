
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

// Функция для получения идентификатора продукта из ссылки или генерации кода товара
export const extractProductId = (link: string, fallbackId: string): string => {
  // Конкретные шаблоны для разных магазинов
  // Adidas: /fussballliebe-training-ball/IN9366.html
  const adidasPattern = /\/([^\/]+)\/([A-Z0-9]{6})\.html/;
  const adidasMatch = link.match(adidasPattern);
  if (adidasMatch && adidasMatch[2]) {
    return adidasMatch[2]; // Возвращаем код продукта, например IN9366
  }
  
  // Nike: /t/air-force-1-07-shoes-WrLlWX/CW2288-111
  const nikePattern = /\/t\/[^\/]+\/([A-Z0-9]+-[0-9]+)/;
  const nikeMatch = link.match(nikePattern);
  if (nikeMatch && nikeMatch[1]) {
    return nikeMatch[1];
  }
  
  // Amazon: /dp/B07PXGQC1Q/
  const amazonPattern = /\/dp\/([A-Z0-9]{10})/;
  const amazonMatch = link.match(amazonPattern);
  if (amazonMatch && amazonMatch[1]) {
    return amazonMatch[1];
  }
  
  // Общие шаблоны для других магазинов
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

// Получение реальной ссылки на страницу товара
export const getProductLink = (product: Product): string => {
  // Если у продукта есть прямая ссылка на магазин, используем её напрямую
  // Исключаем ссылки на поисковые системы и неопределенные ссылки
  if (product.link && 
     (product.link.startsWith('http') && 
      !product.link.includes('undefined') && 
      !product.link.includes('google.com/search') &&
      !product.link.includes('google.com/shopping'))) {
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
  if (domain.includes('amazon')) {
    return `https://${domain}/dp/${productId}`;
  } else if (domain.includes('ebay')) {
    return `https://${domain}/itm/${productId}`;
  } else if (domain.includes('nike')) {
    // Для Nike используем специальный формат
    return `https://${domain}/t/${productSlug}/${productId}.html`;
  } else if (domain.includes('adidas')) {
    // Для Adidas используем формат как в примере
    return `https://${domain}/${productSlug}/${productId}.html`;
  } else if (domain.includes('zalando')) {
    // Для Zalando
    return `https://${domain}/item/${productSlug}-${productId}.html`;
  } else if (domain.includes('footlocker')) {
    return `https://${domain}/en/product/~/${productId}.html`;
  } else if (domain.includes('jdsports')) {
    return `https://${domain}/product/${productSlug}/${productId}/`;
  } else if (domain.includes('asos')) {
    return `https://${domain}/products/${productSlug}/${productId}`;
  } else if (domain.includes('zara')) {
    return `https://${domain}/products/${productSlug}-p${productId}.html`;
  } else if (domain.includes('hm')) {
    return `https://${domain}/en_gb/productpage.${productId}.html`;
  } else {
    // Для других магазинов используем стандартный формат
    return `https://${domain}/product/${productSlug}-${productId}`;
  }
};
