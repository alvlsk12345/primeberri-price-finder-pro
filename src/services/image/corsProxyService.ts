/**
 * Сервис для работы с CORS-прокси
 * 
 * Этот модуль предоставляет функционал для обхода ограничений CORS
 * при запросах к внешним API, таким как OpenAI API или получение изображений.
 */

// Список доступных публичных CORS прокси-сервисов
const CORS_PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=', // Более стабильный прокси
  'https://cors.eu.org/',                     // Европейский CORS-прокси
  'https://corsproxy.io/?',                   // Популярный прокси
  'https://api.allorigins.win/raw?url=',      // Прокси с поддержкой нескольких форматов
  'https://cors-anywhere.herokuapp.com/',     // Часто ограниченный прокси
  'https://thingproxy.freeboard.io/fetch/'    // Ненадежный прокси, используем в последнюю очередь
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
  // Используем текущий прокси из списка
  const proxy = CORS_PROXIES[currentProxyIndex];
  
  // Если URL уже содержит прокси, просто возвращаем его
  if (isProxiedUrl(originalUrl)) {
    return originalUrl;
  }
  
  // Формируем URL с прокси в зависимости от типа прокси
  if (proxy.includes('?url=') || proxy.includes('?quest=')) {
    return `${proxy}${encodeURIComponent(originalUrl)}`;
  }
  
  return `${proxy}${originalUrl}`;
};

/**
 * Переключает на следующий доступный прокси в списке
 * Может использоваться при ошибке текущего прокси
 * 
 * @returns {string} - Название нового текущего прокси
 */
export const switchToNextProxy = (): string => {
  currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
  console.log(`Переключение на следующий CORS прокси: ${CORS_PROXIES[currentProxyIndex]}`);
  return CORS_PROXIES[currentProxyIndex];
};

/**
 * Получает имя текущего используемого прокси
 */
export const getCurrentProxyName = (): string => {
  const proxyUrl = CORS_PROXIES[currentProxyIndex];
  // Извлекаем имя домена из URL
  try {
    const domain = new URL(proxyUrl.replace('?', '')).hostname;
    return domain;
  } catch (e) {
    return proxyUrl;
  }
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
    !url ||
    url.startsWith('data:') ||
    url.includes('amazonaws.com') ||
    url.includes('cloudfront.net') ||
    url.includes('blob:') ||
    url.includes('data:image') ||
    // Локальные доменные исключения
    url.includes('localhost') ||
    url.includes('127.0.0.1')
  );
};

/**
 * Применяет CORS прокси к URL, если он еще не был применен
 * 
 * @param url - Исходный URL
 * @returns URL с примененным CORS прокси
 */
export const applyCorsProxy = (url: string): string => {
  // Проверяем, нужно ли использовать прокси
  if (!url || !shouldUseCorsProxy(url)) {
    return url;
  }
  
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
  
  return CORS_PROXIES.some(proxy => {
    const proxyDomain = proxy.replace(/^https?:\/\//, '').split('?')[0].split('/')[0];
    return url.includes(proxyDomain);
  });
};

/**
 * Возвращает максимальное количество попыток 
 * (равно количеству доступных прокси)
 */
export const getMaxProxyAttempts = (): number => {
  return CORS_PROXIES.length;
};

/**
 * Сбрасывает индекс текущего прокси на первый в списке
 */
export const resetProxyIndex = (): void => {
  currentProxyIndex = 0;
  console.log(`Сброс прокси на первый в списке: ${CORS_PROXIES[currentProxyIndex]}`);
};
