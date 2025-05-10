
/**
 * Сервис для работы с CORS-прокси
 * 
 * Этот модуль предоставляет функционал для обхода ограничений CORS
 * при запросах к внешним API, таким как OpenAI API или получение изображений.
 */

// Список доступных публичных CORS прокси-сервисов
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

// Индекс текущего используемого прокси
let currentProxyIndex = 0;

/**
 * Получает URL с добавленным CORS прокси
 * 
 * @param originalUrl - Оригинальный URL для запроса
 * @returns URL с добавленным CORS прокси
 */
export const getCorsProxyUrl = (originalUrl: string): string => {
  // Используем первый прокси из списка
  const proxy = CORS_PROXIES[currentProxyIndex];
  
  // Если URL уже содержит прокси, просто возвращаем его
  if (originalUrl.startsWith('https://corsproxy.io') || 
      originalUrl.startsWith('https://api.allorigins.win') || 
      originalUrl.startsWith('https://cors-anywhere.herokuapp.com')) {
    return originalUrl;
  }
  
  // Формируем URL с прокси в зависимости от типа прокси
  if (proxy.includes('?url=')) {
    return `${proxy}${encodeURIComponent(originalUrl)}`;
  }
  
  return `${proxy}${originalUrl}`;
};

/**
 * Переключает на следующий доступный прокси в списке
 * Может использоваться при ошибке текущего прокси
 */
export const switchToNextProxy = (): void => {
  currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
  console.log(`Переключение на следующий CORS прокси: ${CORS_PROXIES[currentProxyIndex]}`);
};

/**
 * Добавляет CORS заголовки к параметрам fetch запроса
 * 
 * @param options - Опции для fetch запроса
 * @returns Обновленные опции с CORS заголовками
 */
export const addCorsHeaders = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-Requested-With': 'XMLHttpRequest'
    },
    mode: 'cors'
  };
};

/**
 * Проверяет, должен ли URL использовать CORS прокси
 * 
 * @param url - URL для проверки
 * @returns true, если URL должен использовать CORS прокси
 */
export const shouldUseCorsProxy = (url: string): boolean => {
  // Проверяем, исходит ли URL из источника, который обычно требует CORS прокси
  return !(
    url.startsWith('data:') ||
    url.includes('amazonaws.com') ||
    url.includes('cloudfront.net') ||
    url.includes('blob:') ||
    url.includes('data:image')
  );
};

/**
 * Применяет CORS прокси к URL, если он еще не был применен
 * 
 * @param url - Исходный URL
 * @returns URL с примененным CORS прокси
 */
export const applyCorsProxy = (url: string): string => {
  // Если URL уже содержит прокси, возвращаем его как есть
  if (isProxiedUrl(url)) {
    return url;
  }
  
  // Применяем CORS прокси к URL
  return getCorsProxyUrl(url);
};

/**
 * Проверяет, является ли URL уже проксированным
 * 
 * @param url - URL для проверки
 * @returns true, если URL уже использует CORS прокси
 */
export const isProxiedUrl = (url: string): boolean => {
  if (!url) return false;
  
  return (
    url.includes('corsproxy.io') ||
    url.includes('api.allorigins.win') ||
    url.includes('cors-anywhere.herokuapp.com')
  );
};
