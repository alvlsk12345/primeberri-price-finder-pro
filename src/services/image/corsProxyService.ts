
// Список доступных CORS прокси сервисов
const corsProxies = [
  {
    name: 'corsproxy.io',
    url: 'https://corsproxy.io/?',
    isEnabled: true,
    lastError: null as Error | null,
    errorCount: 0
  },
  {
    name: 'allorigins.win',
    url: 'https://api.allorigins.win/raw?url=',
    isEnabled: true,
    lastError: null as Error | null,
    errorCount: 0
  },
  {
    name: 'cors-anywhere (тестовый)',
    url: 'https://cors-anywhere.herokuapp.com/',
    isEnabled: false, // Отключен по умолчанию из-за ограничений
    lastError: null as Error | null,
    errorCount: 0
  },
  {
    name: 'thingproxy (резервный)',
    url: 'https://thingproxy.freeboard.io/fetch/',
    isEnabled: true,
    lastError: null as Error | null,
    errorCount: 0
  }
];

// Индекс текущего прокси
let currentProxyIndex = 0;

/**
 * Получить информацию о текущем прокси
 */
export const getCurrentProxyInfo = () => {
  return {
    index: currentProxyIndex,
    proxy: corsProxies[currentProxyIndex],
    allProxies: corsProxies.map(p => ({
      name: p.name,
      enabled: p.isEnabled,
      errorCount: p.errorCount
    }))
  };
};

/**
 * Переключиться на следующий доступный прокси
 */
export const switchToNextProxy = (): void => {
  console.log('Переключение на следующий CORS прокси...');
  
  // Логируем информацию о текущем прокси
  console.log(`Текущий прокси (до переключения): ${corsProxies[currentProxyIndex].name}`);
  console.log(`Статус ошибок: ${corsProxies[currentProxyIndex].errorCount} ошибок`);
  
  // Увеличиваем счетчик ошибок для текущего прокси
  corsProxies[currentProxyIndex].errorCount++;
  
  // Сохраняем текущий индекс для сравнения
  const previousIndex = currentProxyIndex;
  
  // Находим следующий включенный прокси
  let nextProxyIndex = (currentProxyIndex + 1) % corsProxies.length;
  let loopCount = 0;
  
  // Ограничиваем поиск, чтобы избежать бесконечного цикла
  while (!corsProxies[nextProxyIndex].isEnabled && loopCount < corsProxies.length) {
    nextProxyIndex = (nextProxyIndex + 1) % corsProxies.length;
    loopCount++;
  }
  
  // Если нашли другой включенный прокси, переключаемся на него
  if (corsProxies[nextProxyIndex].isEnabled && nextProxyIndex !== previousIndex) {
    currentProxyIndex = nextProxyIndex;
    console.log(`Переключились на новый прокси: ${corsProxies[currentProxyIndex].name}`);
  } else {
    // Если все прокси отключены или это единственный включенный прокси, сбрасываем ошибки текущего
    console.log('Не найдено других включенных прокси, сбрасываем ошибки текущего прокси');
  }
  
  // Выводим информацию о новом текущем прокси
  console.log(`Текущий прокси (после переключения): ${corsProxies[currentProxyIndex].name}`);
};

/**
 * Применяет CORS прокси к URL изображения
 * @param imageUrl URL изображения
 * @returns URL с примененным CORS прокси
 */
export const applyCorsProxy = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // Если URL уже содержит известный прокси, не применяем прокси повторно
  if (
    imageUrl.includes('corsproxy.io') || 
    imageUrl.includes('allorigins.win') || 
    imageUrl.includes('cors-anywhere') ||
    imageUrl.includes('thingproxy')
  ) {
    console.log(`URL уже содержит прокси: ${imageUrl}`);
    return imageUrl;
  }
  
  // Если изображение по data:image URL, не нужно применять прокси
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // Переходим к следующему прокси, если текущий прокси не включен
  if (!corsProxies[currentProxyIndex].isEnabled) {
    switchToNextProxy();
  }

  // Получаем текущий прокси URL
  const proxyUrl = corsProxies[currentProxyIndex].url;
  
  // Если это CORS Anywhere, прокси URL добавляется в начало
  if (proxyUrl === 'https://cors-anywhere.herokuapp.com/') {
    console.log(`Применяем прокси ${corsProxies[currentProxyIndex].name} к URL: ${imageUrl}`);
    return `${proxyUrl}${imageUrl}`;
  }
  
  // Для других прокси сервисов используем формат ?url=
  // Также кодируем URL для предотвращения проблем с символами
  console.log(`Применяем прокси ${corsProxies[currentProxyIndex].name} к URL: ${imageUrl}`);
  const encodedUrl = encodeURIComponent(imageUrl);
  
  // Для allorigins.win прокси URL уже включает параметр url=
  if (proxyUrl === 'https://api.allorigins.win/raw?url=') {
    return `${proxyUrl}${encodedUrl}`;
  }
  
  // Для corsproxy.io
  if (proxyUrl === 'https://corsproxy.io/?') {
    return `${proxyUrl}${encodedUrl}`;
  }
  
  // Для thingproxy и других прямых прокси
  return `${proxyUrl}${imageUrl}`;
};

/**
 * Проверяет, нужно ли использовать CORS прокси для URL
 * @param url URL для проверки
 * @returns true, если нужно применить CORS прокси
 */
export const shouldUseCorsProxy = (url: string): boolean => {
  if (!url) return false;
  
  // Проверяем, содержит ли URL уже прокси
  if (
    url.includes('corsproxy.io') || 
    url.includes('allorigins.win') || 
    url.includes('cors-anywhere') ||
    url.includes('thingproxy')
  ) {
    return false;
  }
  
  // Для локальных и data URL не нужен прокси
  if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('./')) {
    return false;
  }
  
  // Список доменов, которым обычно нужен CORS прокси
  const domainsNeedingProxy = [
    'googleusercontent.com',
    'fbcdn.net',
    'bing.com',
    'live.com',
    'google.com',
    'gstatic.com',
    'yandex.ru',
    'yandex.net',
    'duckduckgo.com',
    'yimg.com'  // Yahoo Images
  ];
  
  // Проверяем, содержит ли URL какой-либо из проблемных доменов
  return domainsNeedingProxy.some(domain => url.includes(domain));
};
