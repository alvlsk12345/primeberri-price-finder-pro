
/**
 * Парсит и нормализует ответ от API, учитывая разные форматы данных
 */
export const parseApiResponse = (data: any): { products: any[], total: number, totalPages?: number } => {
  console.log('Получен ответ от API, анализируем структуру...');
  console.log('API response format:', JSON.stringify(data).substring(0, 300) + '...');
  
  let products = [];
  let total = 0;
  let totalPages = 1;
  
  // Check for Postman collection response format first
  if (data && data.response && data.success === true) {
    console.log('Обнаружен формат API из Postman коллекции');
    if (Array.isArray(data.response)) {
      products = data.response;
      total = data.response.length;
    } else if (data.response.products && Array.isArray(data.response.products)) {
      products = data.response.products;
      total = data.response.total_results || products.length;
      totalPages = data.response.total_pages || Math.ceil(total / 10);
    }
  } 
  // Check for various other API response formats
  else if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
    // Newest API format (nested data object)
    console.log('Обнаружен формат API с вложенным объектом data');
    products = data.data.products;
    total = data.data.total_results || products.length;
    totalPages = data.data.total_pages || Math.ceil(total / 10);
  } else if (data && Array.isArray(data.products)) {
    // Standard format
    console.log('Обнаружен стандартный формат API');
    products = data.products;
    total = data.total_results || products.length;
    totalPages = data.total_pages || Math.ceil(total / 10);
  } else if (data && Array.isArray(data)) {
    // Direct array format
    console.log('Обнаружен формат прямого массива');
    products = data;
    total = products.length;
  } else {
    // Log the actual received structure for debugging
    console.error('Неожиданный формат ответа от API:', JSON.stringify(data).substring(0, 500) + '...');
    throw new Error('Получены некорректные данные от API');
  }
  
  console.log(`Успешно извлечено ${products.length} товаров из ответа API`);
  return { products, total, totalPages };
};
