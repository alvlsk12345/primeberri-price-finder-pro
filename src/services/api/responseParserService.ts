
/**
 * Парсит и нормализует ответ от API, учитывая разные форматы данных
 */
export const parseApiResponse = (data: any): { products: any[], total: number } => {
  console.log('Получен ответ от API, анализируем структуру...');
  
  // Add detailed logging of the response structure
  try {
    console.log('API response type:', typeof data);
    console.log('API response keys:', data ? Object.keys(data) : 'no data');
    
    if (data && data.data) {
      console.log('API response data keys:', Object.keys(data.data));
      if (data.data.products && data.data.products.length > 0) {
        console.log('First product sample:', JSON.stringify(data.data.products[0], null, 2));
      }
    }
    
    // Log full response (limited to avoid console overflow)
    console.log('Full API response (truncated):', 
      JSON.stringify(data).substring(0, 1000) + 
      (JSON.stringify(data).length > 1000 ? '...' : ''));
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
    console.log('Пробуем найти массив товаров в ответе...');
    
    for (const key in data) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        console.log(`Найден массив в поле "${key}", проверяем содержимое...`);
        
        // Check if this array contains objects that look like products
        if (data[key][0] && (data[key][0].title || data[key][0].name)) {
          console.log(`Найден возможный массив товаров в поле "${key}"`);
          products = data[key];
          total = products.length;
          break;
        }
      }
    }
    
    if (products.length === 0) {
      console.error('Не удалось найти массив товаров в ответе API');
      throw new Error('Получены некорректные данные от API');
    }
  } else {
    // Log the actual received structure for debugging
    console.error('Неожиданный формат ответа от API:', JSON.stringify(data).substring(0, 500) + '...');
    throw new Error('Получены некорректные данные от API');
  }
  
  // Log product structure for the first item
  if (products.length > 0) {
    console.log('Структура первого товара:', Object.keys(products[0]).join(', '));
    console.log('Пример первого товара:', JSON.stringify(products[0], null, 2));
    console.log(`Всего найдено ${products.length} товаров`);
  } else {
    console.log('API вернул пустой массив товаров');
  }
  
  return { products, total };
};
