
import { Product, SearchParams } from "@/services/types";
import { callAbacusApi } from "./apiClient";
import { extractNumericPrice, formatSingleProduct } from "@/services/formatters/singleProductFormatter";
import { searchProductImageGoogle } from "../googleSearchService";

// Тип для ответа от API поиска товаров
type AbacusSearchResponse = {
  products: AbacusProduct[];
  totalCount?: number;
};

// Тип для товара, возвращаемого API Abacus
type AbacusProduct = {
  title: string;
  description?: string;
  price: string;
  currency: string;
  image_url?: string;
  product_url?: string;
  rating?: number;
  store?: string;
  brand?: string;
  availability?: string;
  specifications?: Record<string, string>;
};

/**
 * Преобразует товары из формата Abacus в формат нашего приложения
 * @param products Массив товаров от Abacus API
 * @returns Массив товаров в формате нашего приложения
 */
const mapAbacusProducts = async (products: AbacusProduct[]): Promise<Product[]> => {
  const mappedProducts: Product[] = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Если нет изображения, ищем его через Google CSE
    let imageUrl = product.image_url || '';
    if (!imageUrl && product.title) {
      const searchQuery = `${product.brand || ''} ${product.title}`.trim();
      imageUrl = await searchProductImageGoogle(searchQuery, i);
    }
    
    const mappedProduct: Product = {
      id: `abacus-${Date.now()}-${i}`,
      title: product.title,
      subtitle: product.brand || '',
      price: product.price,
      currency: product.currency || '€',
      image: imageUrl,
      link: product.product_url || '',
      rating: product.rating || 0,
      source: product.store || 'Abacus AI',
      description: product.description,
      availability: product.availability,
      brand: product.brand,
      specifications: product.specifications,
      _numericPrice: extractNumericPrice(product.price),
      country: 'global'
    };
    
    // Применяем форматирование
    const formattedProduct = formatSingleProduct(mappedProduct);
    mappedProducts.push(formattedProduct);
  }
  
  return mappedProducts;
};

/**
 * Выполняет поиск товаров с помощью Abacus AI
 * @param params Параметры поиска
 * @returns Результаты поиска
 */
export const searchProductsViaAbacus = async (params: SearchParams): Promise<{
  products: Product[];
  totalPages: number;
  apiInfo?: Record<string, string>;
}> => {
  try {
    console.log('Поиск товаров через Abacus AI:', params);
    
    // Вызываем API поиска товаров Abacus
    // Предположим, что у Abacus есть метод searchProducts
    const result = await callAbacusApi<AbacusSearchResponse>('searchProducts', 'POST', {
      query: params.query,
      page: params.page,
      limit: 20, // Можно настроить по необходимости
      filters: params.filters,
      countries: params.countries
    });
    
    // Если нет результатов, возвращаем пустой массив
    if (!result || !result.products || result.products.length === 0) {
      console.log('Abacus не вернул результатов поиска');
      return {
        products: [],
        totalPages: 0,
        apiInfo: {
          provider: 'Abacus AI',
          query: params.query,
          results: '0'
        }
      };
    }
    
    // Преобразуем товары в формат нашего приложения
    const products = await mapAbacusProducts(result.products);
    
    console.log(`Найдено ${products.length} товаров через Abacus AI`);
    
    return {
      products,
      totalPages: Math.max(1, Math.ceil((result.totalCount || products.length) / 12)),
      apiInfo: {
        provider: 'Abacus AI',
        query: params.query,
        results: String(products.length)
      }
    };
  } catch (error) {
    console.error('Ошибка при поиске товаров через Abacus AI:', error);
    throw error;
  }
};
