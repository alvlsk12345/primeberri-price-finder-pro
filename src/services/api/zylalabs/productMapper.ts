
import { Product } from "../../types";

/**
 * Преобразует продукты API в стандартный формат с дополнительной информацией
 * @param products Массив продуктов из API
 * @param params Параметры поиска для контекста
 * @returns Обработанные продукты с дополнительными полями
 */
export const mapProductsFromApi = (products: any[], params: any): any[] => {
  return products.map(product => {
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
    
    let country = params.countries && params.countries.length > 0 
      ? params.countries[0].toUpperCase() 
      : 'DE';
      
    if (product.source_country) {
      country = product.source_country.toUpperCase();
    }
    
    return {
      ...product,
      source: source,
      country: country
    };
  });
};
