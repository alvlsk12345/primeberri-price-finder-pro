
import { Product, ProductFilters } from './types';
import { getStoreNameFromUrl } from './imageService';
import { processProductImage } from './imageProcessor';
import { toast } from "@/components/ui/sonner";

// Вспомогательная функция для обработки данных о товарах из Zylalabs API
export const processZylalabsProductsData = (products: any[], filters?: ProductFilters): Product[] => {
  if (!Array.isArray(products) || products.length === 0) {
    console.log('Пустой массив продуктов или некорректный формат');
    toast.info('По вашему запросу ничего не найдено');
    return [];
  }
  
  console.log(`Обработка ${products.length} продуктов с фильтрами:`, filters);
  let invalidImageCounter = 0;

  // Проверяем и корректируем данные о товарах
  const processedProducts = products.map((product: any, index: number) => {
    if (!product || typeof product !== 'object') {
      console.error('Некорректный товар:', product);
      invalidImageCounter++;
      return null;
    }
    
    // Адаптируем поля под разные форматы API
    const title = product.product_title || product.title || product.name || `Товар ${index + 1}`;
    
    // Расширенная обработка различных форматов изображений
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
    // Если нет в offer_images, проверяем thumbnail_image в offer
    else if (product.offer && product.offer.thumbnail_image) {
      imageUrl = product.offer.thumbnail_image;
      console.log(`Использую URL из offer.thumbnail_image: ${imageUrl}`);
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
    
    // Обрабатываем изображение товара
    const processedImageUrl = processProductImage(imageUrl, index);
    
    // Если изображение не прошло валидацию, всё равно продолжаем (даже с пустым URL)
    if (!processedImageUrl) {
      console.log('Товар будет показан без изображения:', title);
    }
    
    // Определяем цену и валюту
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
    
    // Готовим рейтинг
    const rating = product.product_rating || product.rating || product.offer?.rating || 4.0;
    
    // Формируем ссылку на товар
    const link = product.offer?.offer_page_url || product.product_page_url || product.link || product.url || "#";
    
    // Определяем источник товара
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
    
    // Подзаголовок (состояние товара или другая информация)
    const subtitle = product.condition || product.offer?.offer_badge || product.subtitle || "Популярный";
    
    // Извлекаем дополнительную информацию для детального отображения
    const description = product.product_description || product.description || product.offer?.offer_title || '';
    const availability = product.availability || product.stock_status || "В наличии";
    const brand = product.brand || source;
    
    // Извлекаем спецификации товара
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
      description: description,
      availability: availability,
      brand: brand,
      specifications: specifications,
      _numericPrice: numericPrice // Внутреннее поле для фильтрации
    };
  }).filter(product => product !== null); // Фильтруем null продукты
  
  console.log(`Подготовлено товаров: ${processedProducts.length} из ${products.length}`);
  
  // Применяем фильтры к обработанным товарам, если они указаны
  let filteredProducts = processedProducts;
  
  if (filters) {
    filteredProducts = processedProducts.filter((product: any) => {
      // Фильтрация по цене
      if (filters.minPrice && product._numericPrice && product._numericPrice < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product._numericPrice && product._numericPrice > filters.maxPrice) {
        return false;
      }
      
      // Фильтрация по брендам
      if (filters.brands && filters.brands.length > 0 && product.brand && 
          !filters.brands.some(brand => product.brand?.toLowerCase().includes(brand.toLowerCase()))) {
        return false;
      }
      
      // Фильтрация по источникам
      if (filters.sources && filters.sources.length > 0 && 
          !filters.sources.some(source => product.source.toLowerCase().includes(source.toLowerCase()))) {
        return false;
      }
      
      // Фильтрация по рейтингу
      if (filters.rating && product.rating < filters.rating) {
        return false;
      }
      
      return true;
    });
    
    console.log(`После применения фильтров осталось товаров: ${filteredProducts.length}`);
    
    if (filteredProducts.length === 0 && processedProducts.length > 0) {
      toast.info('По заданным фильтрам товары не найдены');
    }
  }
  
  // Уведомляем о количестве найденных товаров
  if (filteredProducts.length === 0) {
    toast.info('По вашему запросу ничего не найдено');
  } else {
    toast.success(`Найдено ${filteredProducts.length} товаров`);
  }
  
  return filteredProducts;
};
