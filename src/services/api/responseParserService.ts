
/**
 * Парсит и нормализует ответ от API, учитывая разные форматы данных
 */
export const parseApiResponse = (data: any, headers?: Headers): { products: any[], total: number, apiInfo?: Record<string, string> } => {
  console.log('Получен ответ от API:', data);
  
  let products = [];
  let total = 0;
  let apiInfo: Record<string, string> | undefined = undefined;
  
  // Extract API usage info from response headers if available
  if (headers) {
    apiInfo = {};
    const headerKeys = [
      'X-Zyla-API-Calls-Monthly-Remaining',
      'X-Zyla-RateLimit-Limit',
      'X-Zyla-API-Calls-Daily-Remaining'
    ];
    
    headerKeys.forEach(key => {
      const value = headers.get(key);
      if (value) {
        apiInfo![key] = value;
      }
    });
    
    // Only return API info if we actually got some data
    if (Object.keys(apiInfo).length === 0) {
      apiInfo = undefined;
    }
  }
  
  if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
    // Новый формат API
    products = data.data.products;
    total = data.data.total_results || products.length;
  } else if (data && Array.isArray(data.products)) {
    // Старый формат
    products = data.products;
    total = data.total_results || products.length;
  } else if (data && Array.isArray(data)) {
    // Прямой массив
    products = data;
    total = products.length;
  } else {
    console.error('Неожиданный формат ответа от API:', data);
    throw new Error('Получены некорректные данные от API');
  }
  
  return { products, total, apiInfo };
};
