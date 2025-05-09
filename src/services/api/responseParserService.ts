
/**
 * Парсит и нормализует ответ от API, учитывая разные форматы данных
 */
export const parseApiResponse = (data: any): { products: any[], total: number } => {
  console.log('Получен ответ от API:', data);
  
  let products = [];
  let total = 0;
  
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
  
  return { products, total };
};
