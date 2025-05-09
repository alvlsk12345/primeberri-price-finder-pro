
/**
 * Парсит и нормализует ответ от API, учитывая разные форматы данных
 */
export const parseApiResponse = (data: any): { products: any[], total: number } => {
  console.log('Получен ответ от API, анализируем структуру...');
  
  // Check for error/empty responses early
  if (!data) {
    console.error('Получен пустой ответ от API');
    return { products: [], total: 0 };
  }
  
  // If we received an error response
  if (data.error || data.errors || data.message) {
    console.error('API вернул ошибку:', 
      data.error || data.errors || data.message || 'Неизвестная ошибка');
    return { products: [], total: 0 };
  }
  
  // Add detailed logging of the response structure
  try {
    console.log('API response type:', typeof data);
    console.log('API response keys:', data ? Object.keys(data) : 'no data');
    
    // Detailed logging of the response structure
    const topLevelKeys = Object.keys(data);
    console.log('Top level keys in response:', topLevelKeys.join(', '));
    
    // Log nested data keys
    topLevelKeys.forEach(key => {
      if (data[key] && typeof data[key] === 'object') {
        console.log(`Keys in ${key}:`, Object.keys(data[key]).join(', '));
      }
    });
    
    // Check if we have data.data.products structure
    if (data.data && data.data.products) {
      console.log('Found products array in data.data.products with length:', 
        data.data.products.length);
      
      if (data.data.products.length > 0) {
        console.log('First product sample:', 
          JSON.stringify(data.data.products[0]).substring(0, 300) + '...');
      }
    }
    // Check if we have direct products array
    else if (data.products) {
      console.log('Found products array directly in response with length:', 
        data.products.length);
      
      if (data.products.length > 0) {
        console.log('First product sample:', 
          JSON.stringify(data.products[0]).substring(0, 300) + '...');
      }
    }
  } catch (e) {
    console.error('Error inspecting API response:', e);
  }
  
  let products = [];
  let total = 0;
  
  // Check for various API response formats based on Postman collection
  if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
    // Newest API format (nested data object) - this matches the expected format from Postman
    console.log('Обнаружен формат API с вложенным объектом data (стандартный формат Zylalabs)');
    products = data.data.products;
    total = data.data.total_results || data.data.total || products.length;
  } else if (data && data.products && Array.isArray(data.products)) {
    // Alternative format
    console.log('Обнаружен альтернативный формат API (products в корне)');
    products = data.products;
    total = data.total_results || data.total || products.length;
  } else if (data && Array.isArray(data)) {
    // Direct array format
    console.log('Обнаружен формат прямого массива');
    products = data;
    total = products.length;
  } else if (data && data.results && Array.isArray(data.results)) {
    // Another alternative format
    console.log('Обнаружен формат с полем results');
    products = data.results;
    total = data.total || products.length;
  } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
    // Try to find any array that might contain products
    console.log('Пытаемся найти массив товаров в ответе...');
    
    // Recursive function to find products array in nested object
    const findProductsArray = (obj: any, path = ''): any[] | null => {
      if (!obj || typeof obj !== 'object') return null;
      
      // Check if this object is an array of products
      if (Array.isArray(obj) && obj.length > 0 && 
          (obj[0].title || obj[0].product_title || obj[0].name)) {
        console.log(`Found potential products array at ${path} with ${obj.length} items`);
        return obj;
      }
      
      // Recursively search in nested objects
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          const found = findProductsArray(obj[key], `${path}.${key}`);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    // Try to find products in the response
    const foundProducts = findProductsArray(data, 'root');
    if (foundProducts) {
      console.log(`Found products array with ${foundProducts.length} items`);
      products = foundProducts;
      total = foundProducts.length;
    } else {
      console.error('No products array found in response');
      return { products: [], total: 0 };
    }
  } else {
    // Log the actual received structure for debugging
    console.error('Unexpected API response format:', typeof data, data ? Object.keys(data) : 'null');
    return { products: [], total: 0 };
  }
  
  // Log product structure and field names
  if (products.length > 0) {
    console.log(`Successfully found ${products.length} products`);
    console.log('Product fields:', Object.keys(products[0]).join(', '));
    
    // Check if products have required fields
    const hasRequiredFields = products.some(p => p.title || p.product_title || p.name);
    if (!hasRequiredFields) {
      console.warn('Products may not have required fields. First item:', products[0]);
    }
  } else {
    console.warn('API returned empty products array');
  }
  
  return { products, total };
};
