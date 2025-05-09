
import { Product } from '../types';

/**
 * Извлекает числовое значение цены из строкового представления
 */
export const extractNumericPrice = (priceString: string | number): number | undefined => {
  // Handle numeric input directly
  if (typeof priceString === 'number') {
    return priceString;
  }
  
  // Handle string input
  if (!priceString || typeof priceString !== 'string') {
    return undefined;
  }
  
  // Try to parse different price formats
  // First, check if it's a simple numeric string
  if (!isNaN(Number(priceString))) {
    return Number(priceString);
  }
  
  // Try to extract numeric value using regex
  const matches = priceString.match(/(\d+[.,]?\d*)/g);
  if (!matches || matches.length === 0) {
    return undefined;
  }
  
  // Use the first match and convert to number
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
    console.log('Formatting product:', product ? JSON.stringify(product).substring(0, 200) + '...' : 'null');
    
    if (!product) {
      throw new Error('Получены пустые данные о товаре');
    }
    
    // Извлекаем идентификатор из разных форматов ответа
    const id = product.product_id || product.id || `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Заголовок товара (название)
    const title = product.product_title || product.title || product.name || 'Неизвестный товар';
    
    // Подзаголовок (бренд, категория или другая информация)
    const subtitle = product.subtitle || 
                     product.brand || 
                     (product.product_attributes && product.product_attributes.Brand) || '';
    
    // Цена и валюта - проверяем разные форматы
    let price = '€0.00';
    if (product.offer && product.offer.price) {
      price = product.offer.price;
    } else if (product.price) {
      price = product.price;
    } else if (product.pricing && product.pricing.price) {
      price = product.pricing.price;
    }
    
    // Make sure price is properly formatted
    if (typeof price === 'number') {
      price = `€${price.toFixed(2)}`;
    }
    
    const currency = product.currency || 'EUR';
    
    // Извлекаем числовое значение цены для фильтрации
    const numericPriceValue = extractNumericPrice(price);
    const _numericPrice = numericPriceValue !== undefined ? numericPriceValue : 0;
    
    // URL изображения - проверяем различные поля
    let image = '';
    
    // Log all potential image fields for debugging
    const imageFields = [
      'product_photos', 'image', 'thumbnail', 'product_photo', 
      'product_images', 'images', 'imageUrl', 'img', 'main_image'
    ];
    
    imageFields.forEach(field => {
      if (product[field]) {
        console.log(`Found image field ${field}:`, 
          Array.isArray(product[field]) 
            ? `Array with ${product[field].length} items` 
            : product[field].substring(0, 100));
      }
    });
    
    // Try to extract image from different possible fields
    if (product.product_photos && product.product_photos.length > 0) {
      // Use first image from array
      image = product.product_photos[0];
    } else if (product.product_images && product.product_images.length > 0) {
      image = product.product_images[0];
    } else if (product.images && product.images.length > 0) {
      image = product.images[0];
    } else if (product.image) {
      image = product.image;
    } else if (product.thumbnail) {
      image = product.thumbnail;
    } else if (product.product_photo) {
      image = product.product_photo;
    } else if (product.img) {
      image = product.img;
    } else if (product.main_image) {
      image = product.main_image;
    } else if (product.imageUrl) {
      image = product.imageUrl;
    }
    
    console.log(`Final image URL: ${image ? image.substring(0, 100) : 'Not found'}`);
    
    // URL страницы товара
    const link = product.product_page_url || 
                (product.offer && product.offer.offer_page_url) || 
                product.link || 
                product.url || '';
    
    // Рейтинг товара
    const rating = parseFloat(product.product_rating) || product.rating || 0;
    
    // Источник (магазин)
    const source = (product.offer && product.offer.store_name) || 
                   product.source || 
                   product.store || 
                   'Неизвестный источник';
    
    // Описание товара
    const description = product.product_description || 
                        product.description || 
                        '';
    
    // Доступность товара
    const availability = product.availability || 
                        (product.offer && product.offer.on_sale ? 'В наличии' : 'Нет данных');
    
    // Бренд товара
    const brand = (product.product_attributes && product.product_attributes.Brand) || 
                  product.brand || 
                  subtitle || 
                  '';
    
    // Спецификации товара (характеристики)
    const specifications = product.product_attributes || {};
    
    const formattedProduct = {
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
    
    console.log('Product successfully formatted:', {
      id: formattedProduct.id,
      title: formattedProduct.title.substring(0, 30) + '...',
      hasImage: !!formattedProduct.image,
      source: formattedProduct.source,
      price: formattedProduct.price,
      _numericPrice: formattedProduct._numericPrice
    });
    
    return formattedProduct;
  } catch (error) {
    console.error('Error formatting product:', error);
    // Return a fallback product object instead of throwing an error
    return {
      id: `error-${Date.now()}`,
      title: 'Ошибка данных',
      subtitle: '',
      price: '€0.00',
      currency: 'EUR',
      image: '',
      link: '',
      rating: 0,
      source: 'Ошибка',
      description: 'Не удалось загрузить информацию о товаре',
      availability: 'Недоступно',
      brand: '',
      specifications: {},
      _numericPrice: 0
    };
  }
};
