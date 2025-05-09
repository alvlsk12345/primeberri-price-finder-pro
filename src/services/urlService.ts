
import { Product, StoreMap } from './types';

// Расширенная карта реальных доменов магазинов
const storeMap: StoreMap = {
  'Amazon': 'amazon.com',
  'Amazon.co.uk': 'amazon.co.uk',
  'Amazon UK': 'amazon.co.uk',
  'eBay': 'ebay.com',
  'eBay UK': 'ebay.co.uk',
  'Zalando': 'zalando.eu',
  'Zalando UK': 'zalando.co.uk',
  'ASOS': 'asos.com',
  'JD Sports': 'jdsports.co.uk',
  'JD Sports UK': 'jdsports.co.uk',
  'Nike Store': 'nike.com',
  'Nike.com': 'nike.com',
  'Nike': 'nike.com',
  'Foot Locker': 'footlocker.eu',
  'FootLocker': 'footlocker.co.uk',
  'Footlocker UK': 'footlocker.co.uk',
  'Sports Direct': 'sportsdirect.com',
  'Sports Direct UK': 'sportsdirect.com',
  'Adidas': 'adidas.com',
  'Adidas UK': 'adidas.co.uk',
  'H&M': 'hm.com',
  'Zara': 'zara.com',
  'Zara UK': 'zara.com',
  'Sportisimo': 'sportisimo.eu',
  'MandM': 'mandmdirect.com',
  'MandM Direct': 'mandmdirect.com',
  'Argos': 'argos.co.uk',
  'Decathlon': 'decathlon.co.uk',
  'Go Outdoors': 'gooutdoors.co.uk',
  'ProDirect': 'prodirectsport.com',
  'Pro Direct': 'prodirect-soccer.com',
  'Pro:Direct Soccer': 'prodirectsoccer.com',
  'Интернет-магазин': 'shop.example.com'
};

// Расширенный список доменов и паттернов поисковых систем
const searchEngines = [
  'google.com',
  'google.co.uk',
  'google.ru',
  'google.',
  'yandex.ru',
  'bing.com',
  'shopping.google',
  'search?',
  'ibp=oshop',
  'q=',
  'query=',
  'shopping.com',
  'marketplace.',
  'search/results',
  'catalogid:',
  'gpcid:',
  'prds='
];

// Улучшенная функция для проверки, является ли ссылка поисковой
export const isSearchEngineLink = (link: string): boolean => {
  // Если ссылка отсутствует, считаем её поисковой для безопасности
  if (!link || link === 'undefined' || link.length < 10) return true;
  
  // Преобразуем в нижний регистр для более надежного сравнения
  const lowerCaseLink = link.toLowerCase();
  
  // Проверяем на общие паттерны поисковых ссылок
  if (lowerCaseLink.includes('/search?')) return true;
  if (lowerCaseLink.includes('query=')) return true;
  if (lowerCaseLink.includes('q=')) return true;
  if (lowerCaseLink.includes('ibp=oshop')) return true;
  if (lowerCaseLink.includes('prds=')) return true;
  if (lowerCaseLink.includes('catalogid:')) return true;
  if (lowerCaseLink.includes('gpcid:')) return true;
  if (lowerCaseLink.includes('headlineOfferId')) return true;
  if (lowerCaseLink.includes('imageDocid:')) return true;
  
  // Проверяем на конкретные домены поисковиков
  return searchEngines.some(engine => lowerCaseLink.includes(engine));
};

// Улучшенная функция для получения доменного имени магазина с учетом вариаций написания
export const getStoreDomain = (storeName: string | undefined): string => {
  if (!storeName) return 'shop.example.com';
  
  // Нормализуем имя магазина для поиска по ключу
  const normalizedStore = Object.keys(storeMap).find(
    store => store.toLowerCase() === storeName.toLowerCase()
  );
  
  return normalizedStore ? storeMap[normalizedStore] : 
         storeName.toLowerCase().includes('amazon') ? 'amazon.com' :
         storeName.toLowerCase().includes('ebay') ? 'ebay.com' :
         storeName.toLowerCase().includes('nike') ? 'nike.com' :
         storeName.toLowerCase().includes('adidas') ? 'adidas.com' :
         storeName.toLowerCase().includes('mandm') ? 'mandmdirect.com' :
         'shop.example.com';
};

// Функция для создания слага из имени продукта
export const createProductSlug = (name: string | undefined): string => {
  // Добавляем проверку на null/undefined и обеспечиваем значение по умолчанию
  if (!name) {
    console.warn('Product name is undefined, using default slug');
    return 'product';
  }
  
  return name.toLowerCase()
    .replace(/[^a-zа-яё0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, ''); // Удаляем тире в начале и конце
};

// Улучшенная функция для извлечения идентификатора продукта из ссылки или генерации кода товара
export const extractProductId = (link: string | undefined, fallbackId: string): string => {
  // Проверяем наличие ссылки
  if (!link || isSearchEngineLink(link)) {
    return fallbackId; // Используем fallbackId для поисковых ссылок или отсутствующих ссылок
  }
  
  // Пытаемся извлечь идентификатор магазина из поисковой ссылки
  if (link.includes('google.com') && link.includes('mid:')) {
    const midMatch = link.match(/mid:([0-9]+)/);
    if (midMatch && midMatch[1]) {
      return midMatch[1]; // Возвращаем найденный ID из ссылки Google
    }
  }

  // Извлечение из ссылок MandM Direct
  const mandmPattern = /([A-Z]{2}[0-9]{5})/i;
  const mandmMatch = link.match(mandmPattern);
  if (mandmMatch && mandmMatch[1]) {
    return mandmMatch[1]; // Возвращаем код продукта, например PU35213
  }
  
  // Извлечение из ссылок Argos
  const argosPattern = /product\/([0-9]{7,9})\//i;
  const argosMatch = link.match(argosPattern);
  if (argosMatch && argosMatch[1]) {
    return argosMatch[1];
  }

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
  
  // Zara: /item/9598/536/251
  const zaraPattern = /\/([0-9]+)\/([0-9]+)\/([0-9]+)/;
  const zaraMatch = link.match(zaraPattern);
  if (zaraMatch && zaraMatch[1]) {
    return `${zaraMatch[1]}${zaraMatch[2]}${zaraMatch[3]}`;
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
  // Проверка на null/undefined для всего объекта продукта
  if (!product) {
    console.warn('Product object is undefined, returning default link');
    return 'https://shop.example.com/product/undefined';
  }
  
  // Если у продукта есть прямая ссылка на магазин, которая не является поисковой, используем её напрямую
  if (product.link && 
     product.link.startsWith('http') && 
     !product.link.includes('undefined') && 
     !isSearchEngineLink(product.link)) {
    console.log('Использую существующую ссылку:', product.link);
    return product.link;
  }
  
  console.log('Создаю новую ссылку для', product.title || 'неизвестный продукт');
  
  // Определяем домен магазина или используем запасной вариант
  const domain = getStoreDomain(product.source);
  
  // Получаем ID продукта либо из уже имеющейся ссылки, либо из ID продукта
  const productId = product.link ? 
    extractProductId(product.link, product.id || `prod-${Date.now()}`) : 
    product.id || `prod-${Date.now()}`;
  
  // Убедимся, что у нас есть заголовок продукта, иначе используем резервный
  const productTitle = product.title || 'product';
  
  // Создаем слаг для URL из имени продукта
  const productSlug = createProductSlug(productTitle);
  
  // Формируем URL с правильными параметрами в зависимости от магазина
  // Специальные обработчики для конкретных магазинов
  
  // MandM Direct
  if (domain.includes('mandmdirect')) {
    // Формат: https://www.mandmdirect.com/01/details/PU35213
    return `https://www.mandmdirect.com/01/details/${productId}`;
  }
  
  // Argos
  if (domain.includes('argos')) {
    // Формат: https://www.argos.co.uk/product/9795095/
    return `https://www.argos.co.uk/product/${productId}/`;
  }
  
  // Стандартные форматы популярных магазинов
  if (domain.includes('amazon')) {
    return `https://www.${domain}/dp/${productId}`;
  } else if (domain.includes('ebay')) {
    return `https://www.${domain}/itm/${productId}`;
  } else if (domain.includes('nike')) {
    // Для Nike используем специальный формат
    return `https://www.${domain}/t/${productSlug}/${productId}.html`;
  } else if (domain.includes('adidas')) {
    // Для Adidas используем формат как в примере
    return `https://www.${domain}/${productSlug}/${productId}.html`;
  } else if (domain.includes('zalando')) {
    // Для Zalando
    return `https://www.${domain}/item/${productSlug}-${productId}.html`;
  } else if (domain.includes('footlocker')) {
    return `https://www.${domain}/en/product/~/${productId}.html`;
  } else if (domain.includes('jdsports')) {
    return `https://www.${domain}/product/${productSlug}/${productId}/`;
  } else if (domain.includes('asos')) {
    return `https://www.${domain}/products/${productSlug}/${productId}`;
  } else if (domain.includes('zara')) {
    return `https://www.${domain}/products/${productSlug}-p${productId}.html`;
  } else if (domain.includes('hm')) {
    return `https://www.${domain}/en_gb/productpage.${productId}.html`;
  } else if (domain.includes('sportsdirect')) {
    return `https://www.${domain}/product/puma-${productSlug}-${productId}`;
  } else if (domain.includes('decathlon')) {
    return `https://www.${domain}/browse/c0-sports/c1-football/c3-footballs/${productId}-${productSlug}.html`;
  } else {
    // Для других магазинов используем стандартный формат
    return `https://www.${domain}/product/${productSlug}-${productId}`;
  }
};
