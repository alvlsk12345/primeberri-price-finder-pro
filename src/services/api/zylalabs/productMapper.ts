
import { Product } from "../../types";
import { processProductImage } from "../../imageProcessor";

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
    
    // Логирование для отладки
    console.log(`Обработка изображения для товара ${product.product_title || 'Unknown'}, индекс: ${index}`);
    
    if (product.product_photos && product.product_photos.length > 0) {
      console.log(`Найдены product_photos, используем первое из ${product.product_photos.length} изображений`);
      imageUrl = processProductImage(product.product_photos[0], index) || '';
    } else if (product.image) {
      console.log(`Найдено поле image: ${product.image?.substring(0, 100)}`);
      imageUrl = processProductImage(product.image, index) || '';
    } else {
      console.log(`Не найдены изображения для товара ${product.product_title || 'Unknown'}`);
      imageUrl = '';
    }
    
    console.log(`Итоговый URL изображения: ${imageUrl?.substring(0, 100)}`);
    
    // Преобразование в формат Product
    return {
      id: product.product_id || `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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
