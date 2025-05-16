
import { Product } from "../../types";
import { processProductImage } from "../../imageProcessor";
import { formatImageUrl } from "../../image/imageUrlFormatter";
import { isZylalabsImage } from "../../image/imageSourceDetector";

/**
 * Преобразует продукты API в стандартный формат с дополнительной информацией
 * @param products Массив продуктов из API
 * @param params Параметры поиска для контекста
 * @returns Обработанные продукты с дополнительными полями
 */
export const mapProductsFromApi = (products: any[], params: any): Product[] => {
  return products.map((product, index) => {
    // Определяем источник товара (магазин)
    let source = "merchant"; 
    
    if (product.product_page_url) {
      try {
        const url = new URL(product.product_page_url);
        source = url.hostname.replace('www.', '').split('.')[0];
        if (source === 'google' || source === 'shopping') {
          if (product.offer && product.offer.store_name) {
            source = product.offer.store_name;
          } else if (product.merchant_name) {
            source = product.merchant_name;
          }
        }
      } catch (e) {
        console.log('Не удалось извлечь имя магазина из URL');
      }
    }
    
    if (product.merchant_name) {
      source = product.merchant_name;
    } else if (product.offer && product.offer.store_name) {
      source = product.offer.store_name;
    } else if (product.source_name) {
      source = product.source_name;
    }
    
    // Определяем страну
    let country = params.countries && params.countries.length > 0 
      ? params.countries[0].toUpperCase() 
      : 'DE';
      
    if (product.sourceCountry) {
      country = product.sourceCountry.toUpperCase();
    } else if (product.source_country) {
      country = product.source_country.toUpperCase();
    }
    
    // Улучшенная обработка URL изображения
    let imageUrl = '';
    const productId = product.product_id || `zyla-${Date.now()}-${index}`;
    
    console.log(`=== Обработка изображения для товара ${productId}: ${product.product_title || 'Unknown'} ===`);
    
    // Пробуем найти изображение в разных местах ответа API
    let rawImageUrl = null;
    
    if (product.product_photos && product.product_photos.length > 0) {
      console.log(`Найдены product_photos (${product.product_photos.length}): ${JSON.stringify(product.product_photos[0]).substring(0, 100)}`);
      rawImageUrl = product.product_photos[0];
    } else if (product.image) {
      console.log(`Найдено поле image: ${product.image?.substring(0, 100)}`);
      rawImageUrl = product.image;
    } else if (product.product_image) {
      console.log(`Найдено поле product_image: ${product.product_image?.substring(0, 100)}`);
      rawImageUrl = product.product_image;
    } else if (product.product_images && product.product_images.length > 0) {
      console.log(`Найдены product_images, используем первое из ${product.product_images.length}`);
      rawImageUrl = product.product_images[0];
    } else if (product.offer && product.offer.image) {
      console.log(`Найдено изображение в offer: ${product.offer.image?.substring(0, 100)}`);
      rawImageUrl = product.offer.image;
    }
    
    if (rawImageUrl) {
      // Форматируем URL изображения
      const formattedUrl = formatImageUrl(rawImageUrl);
      console.log(`Форматированный URL: ${formattedUrl}`);
      
      // Проверяем, является ли это изображением Zylalabs
      const isFromZylalabs = isZylalabsImage(formattedUrl);
      console.log(`Изображение от Zylalabs: ${isFromZylalabs}`);
      
      // Обрабатываем изображение с учетом индекса для кэширования
      imageUrl = processProductImage(formattedUrl, index, isFromZylalabs) || '';
      console.log(`Финальный URL изображения: ${imageUrl.substring(0, 100)}`);
    } else {
      console.log(`Не найдены изображения для товара ${productId}`);
    }
    
    // Преобразование в формат Product
    return {
      id: productId,
      title: product.product_title || 'Без названия',
      subtitle: product.product_attributes?.Brand || '',
      price: (product.offer && product.offer.price) || product.price || 'Цена не указана',
      currency: product.currency || 'EUR',
      image: imageUrl,
      link: (product.offer && product.offer.offer_page_url) || product.product_page_url || product.link || '',
      rating: parseFloat(product.product_rating) || 0,
      source: source,
      description: product.product_description || '',
      availability: product.availability || (product.offer?.on_sale ? 'В наличии' : 'Нет данных'),
      brand: product.product_attributes?.Brand || '',
      specifications: product.product_attributes || {},
      _numericPrice: extractNumericPrice((product.offer && product.offer.price) || product.price || '0'),
      country: country.toLowerCase()
    };
  });
};

/**
 * Извлекает числовое значение цены из строкового представления
 */
function extractNumericPrice(priceString: string): number | undefined {
  // Ищем все числовые значения в строке (включая десятичные)
  const matches = priceString.match(/(\d+[.,]?\d*)/g);
  
  if (!matches || matches.length === 0) {
    return undefined;
  }
  
  // Берем первое найденное числовое значение и конвертируем его в число
  // Заменяем запятую на точку для корректной конвертации
  const numericValue = parseFloat(matches[0].replace(',', '.'));
  return isNaN(numericValue) ? undefined : numericValue;
}
