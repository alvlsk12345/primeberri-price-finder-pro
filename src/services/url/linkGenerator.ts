
import { Product } from '../types';
import { extractProductId } from './productIdExtractor';
import { getStoreMapEntry } from './storeMapper';
import { createSlug } from './slugCreator';
import { isSearchEngineLink } from './searchEngineDetector';

/**
 * Генерирует ссылку на товар
 */
export const getProductLink = (product: Product | null): string => {
  // Return a fallback URL if product is null
  if (!product) {
    return '#';
  }
  
  // Use product's original link if available and not a search engine link
  if (product.link && !isSearchEngineLink(product.link)) {
    return product.link;
  }
  
  // If we don't have source or title, we can't generate a proper link
  if (!product.source || !product.title) {
    console.warn('Product missing source or title, fallback to general link');
    return '#';
  }
  
  // Get store name from domain
  const storeName = getStoreMapEntry(product.source);
  
  // Extract product ID
  const productId = extractProductId(product.id);
  
  // Create a URL-friendly slug from the product title
  const productSlug = createSlug(product.title);
  
  // Generate a direct link based on store and product information
  return `https://${storeName}.com/product/${productId}/${productSlug}`;
};

// Re-export other functions
export { isSearchEngineLink } from './searchEngineDetector';
