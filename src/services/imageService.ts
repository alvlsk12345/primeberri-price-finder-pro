
// Функции для работы с изображениями

// Проверка является ли URL от Google Shopping
export const isGoogleShoppingImage = (url: string): boolean => {
  return url.includes('encrypted-tbn') || 
         url.includes('googleusercontent') || 
         url.includes('gstatic.com/shopping');
};

// Проверка валидности URL изображения
export const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  
  // Разрешаем URL изображений от Google Shopping (encrypted-tbn)
  // и от других популярных CDN
  if (isGoogleShoppingImage(url)) {
    return true;
  }
  
  // Разрешаем data URLs для изображений
  if (url.startsWith('data:image/')) {
    return true;
  }
  
  // Базовая валидация URL
  try {
    new URL(url);
    
    // Проверка расширений файлов изображений - расширенный список
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif', '.tiff'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Проверка на содержание ключевых слов для изображений - расширенный список
    const imageKeywords = [
      'image', 'img', 'photo', 'picture', 'product', 'thumb', 'preview', 'media', 'asset',
      'photo', 'pic', 'thumbnail', 'gallery', 'cover', 'shot', 'icon'
    ];
    const hasImageKeyword = imageKeywords.some(keyword => url.toLowerCase().includes(keyword));
    
    // Проверка на популярные CDN и хостинги изображений
    const imageCDNs = [
      'cloudfront.net', 'cloudinary.com', 'imgix.net', 's3.amazonaws', 'cdninstagram', 
      'akamaized', 'cdn', 'media', 'images', 'static', 'assets', 'shopify', 'adidas.com',
      'nike.com', 'amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'etsy.com',
      'akamai', 'fastly.net', 'imgur.com', 'googleusercontent.com', 'ggpht.com',
      'blob.core', 'storage.googleapis', 'store-images', 'ytimg', 'pexels', 'unsplash',
      'pixabay', 'flickr', 'twimg', 'wp-content', 'alicdn', 'aliexpress', 'shutterstock',
      'ibb.co', 'imgbb', 'postimg', 'postimages', 'blob:', 'data:image',
      'gstatic.com', 'shopping'
    ];
    const usesImageCDN = imageCDNs.some(cdn => url.toLowerCase().includes(cdn));
    
    // Если URL содержит только домен (например, www.example.com без пути), 
    // то, вероятно, это не URL изображения
    const hasPath = url.split('/').length > 3;
    
    // Защита от некоторых нестандартных URL, которые не являются изображениями
    const suspiciousKeywords = ['javascript:', 'script', 'file:', 'about:', 'data:text', 'moz-extension'];
    const hasSuspiciousKeyword = suspiciousKeywords.some(keyword => url.toLowerCase().includes(keyword));
    
    // Учитываем особые случаи для данных из API
    const isSpecialCase = url.includes('etsy.com/listing') || url.includes('product-images');
    
    return !hasSuspiciousKeyword && (isSpecialCase || hasPath && (hasImageExtension || hasImageKeyword || usesImageCDN));
  } catch (e) {
    console.error('Невалидный URL:', e, url);
    return false;
  }
};

// Добавление уникальных параметров к URL для предотвращения кеширования
export const getUniqueImageUrl = (url: string, index: number): string => {
  try {
    // Проверка на пустой URL
    if (!url) return '';
    
    // Проверяем, содержит ли URL encrypted-tbn (Google Shopping)
    // или другие специфические URL, которые не следует модифицировать
    if (isGoogleShoppingImage(url)) {
      return url;
    }
    
    // Обрабатываем data URL и blob URL без изменений
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    
    // Для других URL добавляем уникальный параметр
    const uniqueParam = `nocache=${Date.now()}-${index}`;
    
    // Проверяем, содержит ли URL уже параметры
    if (url.includes('?')) {
      return `${url}&${uniqueParam}`;
    } else {
      return `${url}?${uniqueParam}`;
    }
  } catch (e) {
    console.error('Ошибка при обработке URL изображения:', e, url);
    // В случае ошибки возвращаем исходный URL
    return url;
  }
};

// Получение доменного имени из URL
export const getDomainFromUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    // Удаляем www. из начала домена, если оно есть
    return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
  } catch (e) {
    return '';
  }
};

// Функция для извлечения имени магазина из URL или домена
export const getStoreNameFromUrl = (url: string): string => {
  try {
    const domain = getDomainFromUrl(url);
    
    // Проверяем известные домены магазинов
    if (domain.includes('amazon')) return 'Amazon';
    if (domain.includes('ebay')) return 'eBay';
    if (domain.includes('walmart')) return 'Walmart';
    if (domain.includes('target')) return 'Target';
    if (domain.includes('bestbuy')) return 'Best Buy';
    if (domain.includes('nike')) return 'Nike';
    if (domain.includes('adidas')) return 'Adidas';
    if (domain.includes('zalando')) return 'Zalando';
    if (domain.includes('asos')) return 'ASOS';
    if (domain.includes('etsy')) return 'Etsy';
    if (domain.includes('zara')) return 'Zara';
    if (domain.includes('apple')) return 'Apple';
    if (domain.includes('gstatic') || domain.includes('googleusercontent')) return 'Google Shopping';
    
    // Если не нашли совпадений, возвращаем домен как имя магазина
    const domainParts = domain.split('.');
    if (domainParts.length > 0) {
      // Возвращаем первую часть домена с заглавной буквы
      return domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
    }
    
    return domain || 'Онлайн-магазин';
  } catch (e) {
    return 'Онлайн-магазин';
  }
};
