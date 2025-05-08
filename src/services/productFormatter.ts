
import { Product } from './types';
import { getStoreNameFromUrl } from './imageService';
import { processProductImage } from './imageProcessor';
import { toast } from "@/components/ui/sonner";

// Вспомогательная функция для обработки данных о товарах из Zylalabs API
export const processZylalabsProductsData = (products: any[]): Product[] => {
  if (!Array.isArray(products) || products.length === 0) {
    console.log('Пустой массив продуктов или некорректный формат');
    toast.info('По вашему запросу ничего не найдено');
    return [];
  }
  
  console.log(`Обработка ${products.length} продуктов`);
  let invalidImageCounter = 0;

  // Проверяем и корректируем данные о товарах
  const validProducts = products.slice(0, 12).map((product: any, index: number) => {
    if (!product || typeof product !== 'object') {
      console.error('Некорректный товар:', product);
      invalidImageCounter++;
      return null;
    }
    
    // Адаптируем поля под разные форматы API
    const title = product.product_title || product.title || product.name || `Товар ${index + 1}`;
    
    // Обработка различных форматов изображений
    let imageUrl = '';
    
    // Попытка получить URL из массива product_photos
    if (product.product_photos && Array.isArray(product.product_photos) && product.product_photos.length > 0) {
      imageUrl = product.product_photos[0];
      console.log(`Использую URL из product_photos: ${imageUrl}`);
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
    
    // Обрабатываем изображение товара
    const processedImageUrl = processProductImage(imageUrl, index);
    
    // Если изображение не прошло валидацию, всё равно продолжаем (даже с пустым URL)
    if (!processedImageUrl) {
      console.log('Товар будет показан без изображения:', title);
    }
    
    // Определяем цену и валюту
    let price = "N/A";
    let currency = "$";
    
    if (product.typical_price_range && Array.isArray(product.typical_price_range)) {
      price = product.typical_price_range[0];
      if (price && !price.includes('$')) {
        price = '$' + price;
      }
    } else if (product.price) {
      price = product.price;
      currency = product.currency || "$";
    } else if (product.offer && product.offer.price) {
      price = product.offer.price;
      currency = product.offer.currency || "$";
    }
    
    const priceString = typeof price === 'string' ? price : `${currency}${price}`;
    
    // Готовим рейтинг
    const rating = product.product_rating || product.rating || 4.0;
    
    // Формируем ссылку на товар
    const link = product.product_page_url || product.link || product.url || "#";
    
    // Определяем источник товара
    let source = "Google Shopping";
    
    if (product.source) {
      source = product.source;
    } else if (product.merchant && product.merchant.name) {
      source = product.merchant.name;
    } else if (link && link !== "#") {
      // Пытаемся определить источник из ссылки
      source = getStoreNameFromUrl(link);
    }
    
    // Подзаголовок (состояние товара или другая информация)
    const subtitle = product.condition || product.subtitle || "Популярный";
    
    return {
      id: product.product_id || product.id || `${Date.now()}-${index}`,
      title: title,
      subtitle: subtitle,
      price: priceString,
      currency: currency,
      image: processedImageUrl,
      link: link,
      rating: rating,
      source: source
    };
  }).filter(product => product !== null); // Фильтруем null продукты
  
  console.log(`Валидных товаров: ${validProducts.length} из ${products.length}`);
  
  // Показываем информацию, если были выявлены проблемы с изображениями
  if (invalidImageCounter > 0) {
    const validCount = validProducts.length;
    const totalCount = Math.min(products.length, 12);
    
    if (validCount === 0) {
      toast.warning('Не удалось найти товары с корректными изображениями');
    } else if (invalidImageCounter > 0) {
      toast.warning(`Найдено ${validCount} из ${totalCount} товаров с корректными изображениями`);
    }
  }
  
  return validProducts;
};
