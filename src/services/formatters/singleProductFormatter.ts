
import { Product } from '../types';
import { processProductImage } from '../imageProcessor';

/**
 * Извлекает числовое значение цены из строкового представления
 */
export const extractNumericPrice = (priceString: string): number | undefined => {
  // Ищем все числовые значения в строке (включая десятичные)
  const matches = priceString.match(/(\d+[.,]?\d*)/g);
  
  if (!matches || matches.length === 0) {
    return undefined;
  }
  
  // Берем первое найденное числовое значение и конвертируем его в число
  // Заменяем запятую на точку для корректной конвертации
  const numericValue = parseFloat(matches[0].replace(',', '.'));
  return isNaN(numericValue) ? undefined : numericValue;
};

/**
 * Форматирует данные о товаре, полученные от Zylalabs API, в единый формат
 */
export const formatSingleProduct = async (
  product: any
): Promise<Product> => {
  try {
    // Извлекаем идентификатор из разных форматов ответа
    const id = product.product_id || product.id || `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Заголовок товара (название)
    const title = product.product_title || product.title || 'Неизвестный товар';
    
    // Подзаголовок (бренд, категория или другая информация)
    const subtitle = product.subtitle || product.product_attributes?.Brand || '';
    
    // Цена и валюта
    const price = product.offer?.price || product.price || 'Цена не указана';
    const currency = product.currency || 'USD';
    
    // Извлекаем числовое значение цены для фильтрации
    const _numericPrice = extractNumericPrice(price);
    
    // URL изображения - улучшенная обработка изображений
    let image = '';
    if (product.product_photos && product.product_photos.length > 0) {
      // Используем первое изображение из списка и обрабатываем его через processProductImage
      console.log(`Обрабатываем URL из product_photos: ${product.product_photos[0]}`);
      image = product.product_photos[0];
    } else if (product.image) {
      // Используем указанное изображение
      image = product.image;
    } else if (product.thumbnail) {
      // Используем миниатюру
      image = product.thumbnail;
    }
    
    // Обрабатываем изображение через усовершенствованный imageProcessor для корректной работы с CORS
    if (image) {
      image = processProductImage(image, 0);
      console.log(`Обработанный URL изображения: ${image}`);
    }
    
    // URL страницы товара
    const link = product.product_page_url || product.offer?.offer_page_url || product.link || '';
    
    // Рейтинг товара
    const rating = parseFloat(product.product_rating) || product.rating || 0;
    
    // Источник (магазин)
    const source = product.offer?.store_name || product.source || 'Неизвестный источник';
    
    // Описание товара
    const description = product.product_description || product.description || '';
    
    // Доступность товара
    const availability = product.availability || (product.offer?.on_sale ? 'В наличии' : 'Нет данных');
    
    // Бренд товара
    const brand = product.product_attributes?.Brand || product.brand || subtitle || '';
    
    // Спецификации товара (характеристики)
    const specifications = product.product_attributes || {};
    
    return {
      id,
      title,
      subtitle,
      price,
      currency,
      image,
      link,
      rating,
      source,
      description,
      availability,
      brand,
      specifications,
      _numericPrice
    };
  } catch (error) {
    console.error('Ошибка при форматировании товара:', error);
    throw error;
  }
};
