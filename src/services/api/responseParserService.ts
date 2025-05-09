
/**
 * Парсит и нормализует ответ от API, учитывая разные форматы данных
 */
export const parseApiResponse = (data: any): { products: any[], total: number } => {
  console.log('Получен ответ от API, анализируем структуру...');
  
  let products = [];
  let total = 0;
  
  // Check for various API response formats
  if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
    // Newest API format (nested data object)
    console.log('Обнаружен формат API с вложенным объектом data');
    products = data.data.products;
    total = data.data.total_results || products.length;
  } else if (data && Array.isArray(data.products)) {
    // Standard format
    console.log('Обнаружен стандартный формат API');
    products = data.products;
    total = data.total_results || products.length;
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
  return { products, total };
};
