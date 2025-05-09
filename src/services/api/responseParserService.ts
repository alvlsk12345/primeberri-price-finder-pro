
/**
 * Парсит и нормализует ответ от API, учитывая разные форматы данных
 */
export const parseApiResponse = (data: any): { products: any[], total: number, totalPages?: number } => {
  console.log('Получен ответ от API, анализируем структуру...');
  
  // Log the actual received structure for debugging
  const dataStr = JSON.stringify(data).substring(0, 500);
  console.log('Структура полученных данных (первые 500 символов):', dataStr + (dataStr.length >= 500 ? '...' : ''));
  
  let products = [];
  let total = 0;
  let totalPages = 1;
  
  // Check for various API response formats
  if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
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
    totalPages = 1;
  } else if (data && typeof data === 'object') {
    // Try to find products in any available field
    console.log('Ищем товары в произвольной структуре ответа');
    
    const possibleProductArrays = Object.values(data).filter(val => 
      Array.isArray(val) && val.length > 0 && 
      typeof val[0] === 'object' && 
      (val[0].title || val[0].name || val[0].product)
    );
    
    if (possibleProductArrays.length > 0) {
      // Use the largest array found
      const largestArray = possibleProductArrays.reduce(
        (acc, arr) => arr.length > acc.length ? arr : acc, 
        []
      );
      console.log(`Найден массив товаров длиной ${largestArray.length}`);
      products = largestArray;
      total = products.length;
    } else {
      console.error('Не удалось найти массив товаров в ответе');
      throw new Error('Получены некорректные данные от API');
    }
  } else {
    // Log the actual received structure for debugging
    console.error('Неожиданный формат ответа от API:', JSON.stringify(data).substring(0, 500) + '...');
    throw new Error('Получены некорректные данные от API');
  }
  
  console.log(`Успешно извлечено ${products.length} товаров из ответа API, всего товаров: ${total}, страниц: ${totalPages}`);
  return { products, total, totalPages };
};
