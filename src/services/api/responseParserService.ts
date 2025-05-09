
/**
 * Парсит и нормализует ответ от API, учитывая разные форматы данных
 */
export const parseApiResponse = (data: any, headers?: Headers): { products: any[], total: number, apiInfo?: Record<string, string> } => {
  console.log('Парсинг ответа от API:', data);
  
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
  
  // Проверяем формат данных API на основе примера API ответа
  if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
    // Новый формат API с вложенной структурой data.data.products
    console.log('Обнаружен новый формат API с data.data.products:', data.data.products.length);
    products = data.data.products;
    total = data.data.total_results || products.length;
  } else if (data && Array.isArray(data.products)) {
    // Старый формат с data.products
    console.log('Обнаружен формат API с data.products');
    products = data.products;
    total = data.total_results || products.length;
  } else if (data && Array.isArray(data)) {
    // Прямой массив результатов
    console.log('Обнаружен формат API с массивом результатов');
    products = data;
    total = products.length;
  } else if (data && data.status === "OK" && data.data && Array.isArray(data.data.products)) {
    // Формат из примера API ответа
    console.log('Обнаружен формат API из примера с status:OK и data.products');
    products = data.data.products;
    total = data.data.products.length;
  } else {
    console.error('Неожиданный формат ответа от API:', data);
    console.warn('Возвращаем пустой массив продуктов');
    products = [];
    total = 0;
  }
  
  // Логируем результат парсинга
  console.log(`Парсинг API успешно завершен. Найдено ${products.length} продуктов`);
  
  return { products, total, apiInfo };
};
