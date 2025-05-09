
/**
 * Парсит и нормализует ответ от API, учитывая разные форматы данных
 */
export const parseApiResponse = (data: any): { products: any[], total: number, totalPages?: number } => {
  console.log('Получен ответ от API, анализируем структуру...');
  console.log('API response full format:', JSON.stringify(data).substring(0, 500) + '...');
  
  let products = [];
  let total = 0;
  let totalPages = 1;
  
  // Проверка ответа на ошибки от API
  if (data && data.success === false && data.message) {
    console.error('API вернул ошибку:', data.message);
    throw new Error(`API вернул ошибку: ${data.message}`);
  }
  
  try {
    // Check for Postman collection response format first (primary format)
    if (data && data.success === true && data.response) {
      console.log('Обнаружен формат API из Postman коллекции');
      
      if (Array.isArray(data.response)) {
        console.log('Ответ является массивом продуктов');
        products = data.response;
        total = data.response.length;
      } else if (data.response.products && Array.isArray(data.response.products)) {
        console.log('Ответ содержит вложенный массив products');
        products = data.response.products;
        total = data.response.total_results || products.length;
        totalPages = data.response.total_pages || Math.ceil(total / 10);
      } else if (typeof data.response === 'object') {
        console.log('Ответ является объектом, ищем продукты внутри');
        // Попробуем найти массив внутри response
        const possibleArrays = Object.keys(data.response).filter(key => 
          Array.isArray(data.response[key]) && 
          data.response[key].length > 0 && 
          typeof data.response[key][0] === 'object'
        );
        
        if (possibleArrays.length > 0) {
          console.log('Найдены потенциальные массивы продуктов:', possibleArrays);
          products = data.response[possibleArrays[0]];
          total = products.length;
        } else {
          console.log('Не найдены массивы в ответе, используем весь объект response');
          products = [data.response]; // Используем сам response как продукт
          total = 1;
        }
      } else {
        console.log('Необычный формат response:', typeof data.response);
        products = [];
        total = 0;
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
    } else if (data && typeof data === 'object') {
      // Попробуем найти массив в корне объекта
      console.log('Поиск массива продуктов в корне объекта');
      const possibleArrays = Object.keys(data).filter(key => 
        Array.isArray(data[key]) && 
        data[key].length > 0 && 
        typeof data[key][0] === 'object'
      );
      
      if (possibleArrays.length > 0) {
        console.log('Найдены потенциальные массивы продуктов:', possibleArrays);
        products = data[possibleArrays[0]];
        total = products.length;
      } else {
        // Log the actual received structure for debugging
        console.error('Не найдены массивы в объекте, структура данных:', Object.keys(data));
        throw new Error('Получены некорректные данные от API: не удалось найти массив продуктов');
      }
    } else {
      // Log the actual received structure for debugging
      console.error('Неожиданный формат ответа от API:', typeof data, data !== null ? Object.keys(data) : 'null');
      throw new Error('Получены некорректные данные от API');
    }
    
    // Проверка результатов
    if (!products || products.length === 0) {
      console.warn('В ответе не найдено товаров');
    } else {
      console.log(`Успешно извлечено ${products.length} товаров из ответа API`);
      console.log('Пример первого товара:', products[0] ? JSON.stringify(products[0]).substring(0, 200) + '...' : 'null');
    }
    
    return { products, total, totalPages };
  } catch (error) {
    console.error('Ошибка при парсинге ответа API:', error);
    throw new Error(`Ошибка при парсинге ответа API: ${error.message}`);
  }
};
