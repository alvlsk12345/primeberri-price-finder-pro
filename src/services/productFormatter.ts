
import { Product } from './types';
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
  const validProducts = products.slice(0, 6).map((product: any, index: number) => {
    if (!product || typeof product !== 'object') {
      console.error('Некорректный товар:', product);
      invalidImageCounter++;
      return null;
    }
    
    // Адаптируем поля под новый формат API
    const title = product.product_title || product.title || `Товар ${index + 1}`;
    
    // Изменения здесь: обрабатываем различные форматы изображений
    let imageUrl = '';
    
    // Попытка получить URL из массива product_photos
    if (product.product_photos && Array.isArray(product.product_photos) && product.product_photos.length > 0) {
      imageUrl = product.product_photos[0];
      console.log(`Использую URL из product_photos: ${imageUrl}`);
    } 
    // Если не нашли, пробуем получить из поля image
    else if (product.image) {
      imageUrl = product.image;
      console.log(`Использую URL из image: ${imageUrl}`);
    }
    
    // Обрабатываем изображение товара (даже если это Google Shopping URL)
    const processedImageUrl = imageUrl;
    
    // Если изображение не прошло валидацию, пропускаем товар
    if (!processedImageUrl) {
      console.log('Пропускаем товар из-за невалидного URL изображения:', imageUrl);
      invalidImageCounter++;
      return null;
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
    }
    
    const priceString = typeof price === 'string' ? price : `${currency}${price}`;
    
    // Готовим рейтинг
    const rating = product.product_rating || product.rating || 4.0;
    
    // Формируем ссылку на товар
    const link = product.product_page_url || product.link || "#";
    
    // Источник товара
    const source = product.source || "Google Shopping";
    
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
    const totalCount = Math.min(products.length, 6);
    
    if (validCount === 0) {
      toast.warning('Не удалось найти товары с корректными изображениями');
    } else if (invalidImageCounter > 0) {
      toast.warning(`Найдено ${validCount} из ${totalCount} товаров с корректными изображениями`);
    }
  }
  
  return validProducts;
};
