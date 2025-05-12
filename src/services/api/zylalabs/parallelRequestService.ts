
import { makeZylalabsCountryRequest } from "./countryRequestService";

/**
 * Выполняет параллельные запросы к API Zylalabs для нескольких стран
 * @param query Поисковый запрос
 * @param countryCodes Массив кодов стран
 * @param page Номер страницы
 * @param language Код языка
 * @param signal Объект AbortSignal для отмены запросов (опционально)
 * @returns Комбинированные результаты поиска
 */
export const makeParallelZylalabsRequests = async (
  query: string,
  countryCodes: string[],
  page: number = 1,
  language: string = 'ru',
  signal?: AbortSignal
): Promise<any> => {
  console.log(`Выполняем параллельные запросы для ${countryCodes.length} стран:`, countryCodes);
  
  // Создаем массив промисов запросов для каждой страны
  const requests = countryCodes.map(countryCode => 
    makeZylalabsCountryRequest(query, countryCode, page, language, signal)
      .catch(error => {
        console.warn(`Ошибка при запросе для страны ${countryCode}:`, error);
        return null; // Возвращаем null вместо ошибки для Promise.allSettled
      })
  );
  
  // Выполняем все запросы параллельно и получаем результаты
  const results = await Promise.allSettled(requests);
  
  // Обрабатываем результаты, игнорируя ошибки
  const validResults = results
    .filter((result): result is PromiseFulfilledResult<any> => 
      result.status === 'fulfilled' && result.value !== null)
    .map(result => result.value);
  
  console.log(`Получено ${validResults.length} успешных ответов из ${countryCodes.length} запросов`);
  
  // Собираем все продукты из валидных результатов
  let allProducts: any[] = [];
  let totalPages = 1;
  
  validResults.forEach(result => {
    if (result && result.data) {
      // Проверяем разные структуры ответа
      if (result.data.products) {
        allProducts = [...allProducts, ...result.data.products];
        totalPages = Math.max(totalPages, result.data.total_pages || 1);
      } else if (result.data.data && result.data.data.products) {
        allProducts = [...allProducts, ...result.data.data.products];
        totalPages = Math.max(totalPages, result.data.data.total_pages || 1);
      }
    }
  });
  
  console.log(`Собрано ${allProducts.length} уникальных продуктов из всех запросов`);
  
  // Если нет результатов, возвращаем null для перехода к запасному варианту
  if (allProducts.length === 0) {
    return null;
  }
  
  // Формируем результат в формате, совместимом с ожиданиями парсера
  return {
    data: {
      data: {
        products: allProducts,
        total_pages: totalPages
      },
      status: "OK"
    },
    totalPages: totalPages,
    isDemo: false
  };
};
