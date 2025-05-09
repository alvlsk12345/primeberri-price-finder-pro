
import { Product } from "../types";
import { createProductSlug } from "./slugCreator";
import { getStoreMapEntry } from "./storeMapper";
import { extractProductIdFromUrl } from "./productIdExtractor";
import { isSearchEngineLink } from "./searchEngineDetector";

// Функция для генерации прямой ссылки на товар
export const getProductLink = (product: Product | undefined | null): string => {
  if (!product) {
    console.warn('Attempting to generate link for undefined/null product');
    return '#';
  }

  // Если у товара уже есть ссылка и она не является поисковой - используем её
  if (product.link && !isSearchEngineLink(product.link)) {
    console.log('Использую существующую ссылку:', product.link);
    return product.link;
  }

  // Если у товара нет источника или названия
  if (!product.source || !product.title) {
    console.warn('Product missing source or title, fallback to general link');
    // Fallback к общему слагу и домену магазина, если есть
    const slug = createProductSlug(product.title || 'product');
    return product.source ? 
      `https://${product.source.toLowerCase().replace(/\s+/g, '-')}.com/${slug}` : 
      '#';
  }

  // Используем карту магазинов для генерации ссылки по шаблону
  const storeDomain = getStoreMapEntry(product.source);
  let productId = product.id;

  // Пытаемся извлечь ID товара из имеющейся ссылки, если она есть
  if (product.link) {
    const extractedId = extractProductIdFromUrl(product.link, productId || '');
    if (extractedId) {
      productId = extractedId;
    }
  }

  // Создаем слаг из названия товара
  const slug = createProductSlug(product.title);

  // Стандартный формат URL для большинства магазинов
  return `https://${storeDomain}/product/${slug}/${productId || ''}`;
};
