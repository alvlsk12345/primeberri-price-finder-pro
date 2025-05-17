
/**
 * Парсит и нормализует ответ от API, учитывая разные форматы данных
 */
export const parseApiResponse = (data: any, headers?: Headers): { products: any[], total: number, apiInfo?: Record<string, string> } => {
  console.log('Парсинг ответа от API:', data);
  
  let products = [];
  let total = 0;
  let apiInfo: Record<string, string> | undefined = undefined;
  
  // Извлекаем информацию об использовании API из заголовков ответа, если они доступны
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
    
    // Возвращаем apiInfo только если получили какие-то данные
    if (Object.keys(apiInfo).length === 0) {
      apiInfo = undefined;
    }
  }
  
  // Логируем полный ответ для отладки
  console.log('Полная структура ответа API перед парсингом:', JSON.stringify(data).substring(0, 500) + '...');
  
  // Проверяем различные форматы структуры данных API и извлекаем продукты
  if (data === null || data === undefined) {
    console.error('API вернул null или undefined');
    products = [];
    total = 0;
  } else if (typeof data === 'string') {
    console.error('API вернул строку вместо объекта:', data.substring(0, 100));
    try {
      const parsed = JSON.parse(data);
      return parseApiResponse(parsed, headers); // Рекурсивно вызываем с преобразованными данными
    } catch (e) {
      products = [];
      total = 0;
    }
  } else if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
    // Формат API с вложенной структурой data.data.products
    console.log('Обнаружен формат API с data.data.products:', data.data.products.length);
    products = data.data.products;
    total = data.data.total_results || data.data.total || products.length;
  } else if (data && data.data && Array.isArray(data.data)) {
    // Формат с массивом в data
    console.log('Обнаружен формат API с массивом в data:', data.data.length);
    products = data.data;
    total = data.total_results || data.total || products.length;
  } else if (data && Array.isArray(data.products)) {
    // Формат с data.products
    console.log('Обнаружен формат API с data.products:', data.products.length);
    products = data.products;
    total = data.total_results || data.total || products.length;
  } else if (data && Array.isArray(data)) {
    // Прямой массив результатов
    console.log('Обнаружен формат API с массивом результатов:', data.length);
    products = data;
    total = products.length;
  } else if (data && data.status && data.status === "OK" && data.data && Array.isArray(data.data.products)) {
    // Формат из документации API
    console.log('Обнаружен формат API с status:OK и data.products:', data.data.products.length);
    products = data.data.products;
    total = data.data.products.length;
  } else if (data && data.message) {
    // API вернул сообщение, но не товары
    console.warn('API вернул сообщение без товаров:', data.message);
    products = [];
    total = 0;
    if (!apiInfo) apiInfo = {};
    apiInfo['message'] = data.message;
  } else if (data && data.status && data.status === "ERROR") {
    // API вернул ошибку
    console.error('API вернул ошибку:', data.message || 'Неизвестная ошибка');
    products = [];
    total = 0;
    if (!apiInfo) apiInfo = {};
    apiInfo['error'] = data.message || 'Неизвестная ошибка';
  } else {
    // Неизвестный формат
    console.error('Неизвестный формат ответа от API:', typeof data, JSON.stringify(data).substring(0, 200) + '...');
    
    // Пытаемся найти массив продуктов в корне объекта
    const potentialProductArrays = Object.entries(data).filter(([_, value]) => Array.isArray(value));
    
    if (potentialProductArrays.length > 0) {
      // Берем самый большой массив как наиболее вероятный массив продуктов
      const [key, value] = potentialProductArrays.sort((a, b) => 
        (b[1] as any[]).length - (a[1] as any[]).length
      )[0];
      
      console.log(`Найден возможный массив продуктов в поле ${key}, количество элементов: ${(value as any[]).length}`);
      products = value as any[];
      total = products.length;
    } else {
      console.warn('Не удалось найти массив продуктов, возвращаем пустой массив');
      products = [];
      total = 0;
    }
  }
  
  // Логируем результат парсинга
  console.log(`Парсинг API завершен. Найдено ${products.length} продуктов из ${total}`);
  
  return { products, total, apiInfo };
};
