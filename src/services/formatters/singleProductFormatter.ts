import { Product } from '../types';
import { processProductImage } from '../imageProcessor';
import { getStoreNameFromUrl, isGoogleShoppingImage } from '../imageService';
import { translateText } from '../translationService';

// Функция для форматирования отдельного товара
export const formatSingleProduct = async (product: any, index: number, invalidImageCounter: number): Promise<Product | null> => {
  if (!product || typeof product !== 'object') {
    console.error('Некорректный товар:', product);
    invalidImageCounter++;
    return null;
  }
  
  // Адаптируем поля под разные форматы API
  const title = product.product_title || product.title || product.name || `Товар ${index + 1}`;
  
  // Получаем URL изображения из различных возможных источников
  const imageUrl = extractImageUrl(product);
  
  // Обрабатываем изображение товара с логированием
  console.log(`Обрабатываем изображение для товара "${title}": ${imageUrl}`);
  const processedImageUrl = processProductImage(imageUrl, index);
  
  // Если изображение не прошло валидацию, всё равно продолжаем (даже с пустым URL)
  if (!processedImageUrl) {
    console.log('Товар будет показан без изображения:', title);
    invalidImageCounter++;
  } else {
    // Логируем особый статус для изображений Google Shopping
    if (isGoogleShoppingImage(processedImageUrl)) {
      console.log('Обработано изображение Google Shopping:', processedImageUrl);
    }
  }
  
  // Получаем информацию о цене
  const { priceString, currency, numericPrice } = extractPriceInfo(product);
  
  // Готовим рейтинг
  const rating = product.product_rating || product.rating || product.offer?.rating || 4.0;
  
  // Формируем ссылку на товар
  const link = product.offer?.offer_page_url || product.product_page_url || product.link || product.url || "#";
  
  // Определяем источник товара
  const source = determineProductSource(product, link);
  
  // Подзаголовок (состояние товара или другая информация)
  const subtitle = product.condition || product.offer?.offer_badge || product.subtitle || "Популярный";
  
  // Извлекаем описание для перевода
  const originalDescription = product.product_description || product.description || product.offer?.offer_title || '';
  
  // Переводим описание если оно есть (но не на русский, если уже на русском)
  let translatedDescription = originalDescription;
  try {
    if (originalDescription && originalDescription.length > 10) {
      // Переводим на русский если это не русский текст
      translatedDescription = await translateText(originalDescription, 'en', 'ru');
      console.log(`Описание переведено с ${translatedDescription !== originalDescription ? 'английского' : 'уже на русском'}`);
    }
  } catch (error) {
    console.error('Ошибка при переводе описания:', error);
    // Используем оригинальное описание при ошибке перевода
    translatedDescription = originalDescription;
  }
  
  const availability = product.availability || product.stock_status || "В наличии";
  const brand = product.brand || source;
  
  // Извлекаем спецификации товара
  const specifications = extractProductSpecifications(product);
  
  return {
    id: product.product_id || product.id || `${Date.now()}-${index}`,
    title: title,
    subtitle: subtitle,
    price: priceString,
    currency: currency,
    image: processedImageUrl,
    link: link,
    rating: rating,
    source: source,
    description: translatedDescription,
    availability: availability,
    brand: brand,
    specifications: specifications,
    _numericPrice: numericPrice // Внутреннее поле для фильтрации
  };
};

// Функция для извлечения URL изображения из различных форматов данных API
export const extractImageUrl = (product: any): string => {
  let imageUrl = '';
  
  // Приоритет для изображений из product_photos (массив изображений от API)
  if (product.product_photos && Array.isArray(product.product_photos) && product.product_photos.length > 0) {
    // Берем первое изображение из массива
    imageUrl = product.product_photos[0];
    console.log(`Использую URL из product_photos: ${imageUrl}`);
  } 
  // Если нет в product_photos, проверяем offer_images (для формата конечных магазинов)
  else if (product.offer && product.offer.offer_images && Array.isArray(product.offer.offer_images) && product.offer.offer_images.length > 0) {
    imageUrl = product.offer.offer_images[0];
    console.log(`Использую URL из offer_images: ${imageUrl}`);
  }
  // Если нет в offer_images, проверяем thumbnail в product_variants
  else if (product.product_variants && product.product_variants.Color && 
           Array.isArray(product.product_variants.Color) && 
           product.product_variants.Color.length > 0 &&
           product.product_variants.Color[0].thumbnail) {
    imageUrl = product.product_variants.Color[0].thumbnail;
    console.log(`Использую URL из product_variants.Color[0].thumbnail: ${imageUrl}`);
  }
  // Если нет в thumbnail в variants, проверяем thumbnail_image в offer
  else if (product.offer && product.offer.thumbnail_image) {
    imageUrl = product.offer.thumbnail_image;
    console.log(`Использую URL из offer.thumbnail_image: ${imageUrl}`);
  }
  // Если не нашли, проверяем store_favicon в offer
  else if (product.offer && product.offer.store_favicon) {
    imageUrl = product.offer.store_favicon;
    console.log(`Использую URL из offer.store_favicon: ${imageUrl}`);
  }
  // Если не нашли, пробуем получить из поля image или thumbnail
  else if (product.image) {
    imageUrl = product.image;
    console.log(`Использую URL из image: ${imageUrl}`);
  }
  else if (product.thumbnail) {
    imageUrl = product.thumbnail;
    console.log(`Использую URL из thumbnail: ${imageUrl}`);
  }
  // Последний фоллбэк - искать в merchant_logo
  else if (product.merchant && product.merchant.merchant_logo) {
    imageUrl = product.merchant.merchant_logo;
    console.log(`Использую URL из merchant_logo: ${imageUrl}`);
  }
  
  return imageUrl;
};

// Функция для извлечения информации о цене товара
export const extractPriceInfo = (product: any): { priceString: string; currency: string; numericPrice: number } => {
  let price = "N/A";
  let currency = "$";
  let numericPrice = 0;
  
  // Проверяем различные форматы цен из разных источников
  if (product.offer && product.offer.price) {
    price = product.offer.price;
    currency = product.offer.currency || "$";
    numericPrice = typeof product.offer.price === 'number' ? product.offer.price : parseFloat(price.replace(/[^\d.-]/g, ''));
  } else if (product.typical_price_range && Array.isArray(product.typical_price_range)) {
    price = product.typical_price_range[0];
    if (price && !price.includes('$')) {
      price = '$' + price;
    }
    numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
  } else if (product.price) {
    price = product.price;
    currency = product.currency || "$";
    numericPrice = typeof product.price === 'number' ? product.price : parseFloat(price.replace(/[^\d.-]/g, ''));
  }
  
  const priceString = typeof price === 'string' ? price : `${currency}${price}`;
  
  return { priceString, currency, numericPrice };
};

// Функция для определения источника товара
export const determineProductSource = (product: any, link: string): string => {
  let source = "Google Shopping";
  
  if (product.offer && product.offer.store_name) {
    source = product.offer.store_name;
  } else if (product.source) {
    source = product.source;
  } else if (product.merchant && product.merchant.name) {
    source = product.merchant.name;
  } else if (link && link !== "#") {
    // Пытаемся определить источник из ссылки
    source = getStoreNameFromUrl(link);
  }
  
  return source;
};

// Функция для извлечения спецификаций товара
export const extractProductSpecifications = (product: any): {[key: string]: string} => {
  const specifications: {[key: string]: string} = {};
  
  if (product.specifications && typeof product.specifications === 'object') {
    Object.keys(product.specifications).forEach(key => {
      specifications[key] = product.specifications[key].toString();
    });
  } else if (product.product_attributes && typeof product.product_attributes === 'object') {
    Object.keys(product.product_attributes).forEach(key => {
      specifications[key] = product.product_attributes[key].toString();
    });
  } else if (product.attributes && Array.isArray(product.attributes)) {
    product.attributes.forEach((attr: any) => {
      if (attr.name && attr.value) {
        specifications[attr.name] = attr.value.toString();
      }
    });
  }
  
  return specifications;
};
