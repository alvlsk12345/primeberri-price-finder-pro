
import { Product } from '../types';
import { getStoreDomain } from './storeMapper';
import { extractProductId } from './productIdExtractor';
import { createProductSlug } from './slugCreator';
import { isSearchEngineLink } from './searchEngineDetector';

// Получение реальной ссылки на страницу товара
export const getProductLink = (product: Product): string => {
  // Проверка на null/undefined для всего объекта продукта
  if (!product) {
    console.warn('Product object is undefined, returning default link');
    return 'https://shop.example.com/product/undefined';
  }
  
  // Если у продукта есть прямая ссылка на магазин, которая не является поисковой, используем её напрямую
  if (product.link && 
     product.link.startsWith('http') && 
     !product.link.includes('undefined') && 
     !isSearchEngineLink(product.link)) {
    console.log('Использую существующую ссылку:', product.link);
    return product.link;
  }
  
  console.log('Создаю новую ссылку для', product.title || 'неизвестный продукт');
  
  // Определяем домен магазина или используем запасной вариант
  const domain = getStoreDomain(product.source);
  
  // Получаем ID продукта либо из уже имеющейся ссылки, либо из ID продукта
  const productId = product.link ? 
    extractProductId(product.link, product.id || `prod-${Date.now()}`) : 
    product.id || `prod-${Date.now()}`;
  
  // Убедимся, что у нас есть заголовок продукта, иначе используем резервный
  const productTitle = product.title || 'product';
  
  // Создаем слаг для URL из имени продукта
  const productSlug = createProductSlug(productTitle);
  
  // Формируем URL с правильными параметрами в зависимости от магазина
  // Специальные обработчики для конкретных магазинов
  
  // MandM Direct
  if (domain.includes('mandmdirect')) {
    // Формат: https://www.mandmdirect.com/01/details/PU35213
    return `https://www.mandmdirect.com/01/details/${productId}`;
  }
  
  // Argos
  if (domain.includes('argos')) {
    // Формат: https://www.argos.co.uk/product/9795095/
    return `https://www.argos.co.uk/product/${productId}/`;
  }
  
  // Стандартные форматы популярных магазинов
  if (domain.includes('amazon')) {
    return `https://www.${domain}/dp/${productId}`;
  } else if (domain.includes('ebay')) {
    return `https://www.${domain}/itm/${productId}`;
  } else if (domain.includes('nike')) {
    // Для Nike используем специальный формат
    return `https://www.${domain}/t/${productSlug}/${productId}.html`;
  } else if (domain.includes('adidas')) {
    // Для Adidas используем формат как в примере
    return `https://www.${domain}/${productSlug}/${productId}.html`;
  } else if (domain.includes('zalando')) {
    // Для Zalando
    return `https://www.${domain}/item/${productSlug}-${productId}.html`;
  } else if (domain.includes('footlocker')) {
    return `https://www.${domain}/en/product/~/${productId}.html`;
  } else if (domain.includes('jdsports')) {
    return `https://www.${domain}/product/${productSlug}/${productId}/`;
  } else if (domain.includes('asos')) {
    return `https://www.${domain}/products/${productSlug}/${productId}`;
  } else if (domain.includes('zara')) {
    return `https://www.${domain}/products/${productSlug}-p${productId}.html`;
  } else if (domain.includes('hm')) {
    return `https://www.${domain}/en_gb/productpage.${productId}.html`;
  } else if (domain.includes('sportsdirect')) {
    return `https://www.${domain}/product/puma-${productSlug}-${productId}`;
  } else if (domain.includes('decathlon')) {
    return `https://www.${domain}/browse/c0-sports/c1-football/c3-footballs/${productId}-${productSlug}.html`;
  } else {
    // Для других магазинов используем стандартный формат
    return `https://www.${domain}/product/${productSlug}-${productId}`;
  }
};
