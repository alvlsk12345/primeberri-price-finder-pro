
/**
 * Функции для определения текущего маршрута и страницы настроек
 * Централизованная утилита для использования во всем приложении
 */

// Для дополнительной защиты от ошибок при определении маршрута
const SETTINGS_ROUTE = 'settings';
const INDEX_ROUTE = '';

/**
 * Функция для проверки, находится ли пользователь на странице настроек
 */
export const isOnSettingsPage = (): boolean => {
  console.log(`[navigation.ts -> isOnSettingsPage] ENTER. hash: "${window.location.hash}", pathname: "${window.location.pathname}", data-path: "${document.body.getAttribute('data-path')}"`);
  
  if (typeof window === 'undefined') return false;
  
  // Получаем полную информацию о маршруте для более надежного определения
  const routeInfo = getRouteInfo();
  const result = routeInfo.isSettings;
  
  console.log(`[navigation.ts -> isOnSettingsPage] EXIT. Result: ${result}`);
  return result;
};

/**
 * Функция для получения текущего маршрута в формате, совместимом с HashRouter
 * Возвращает путь без начального слеша для использования с HashRouter
 */
export const getCurrentRoute = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Извлекаем маршрут из хеша (для HashRouter)
  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    return hash.substring(2); // Убираем '#/'
  }
  
  return '';
};

/**
 * Проверяет наличие класса settings-page в body
 * Это дополнительная проверка, которая делает определение страницы настроек более надежным
 */
const hasSettingsPageClass = (): boolean => {
  return document.body.classList.contains('settings-page');
};

/**
 * Функция для надежного определения текущего маршрута независимо от типа маршрутизации
 * @returns Информация о текущем маршруте
 */
export const getRouteInfo = (): { 
  path: string;
  isSettings: boolean;
  isIndex: boolean;
  rawHash: string;
  rawPath: string;
  dataPath: string | null;
  hasSettingsClass: boolean;
  hash: string | null; // Добавляем новое поле для хранения хэша для удобства проверки
} => {
  console.log('[navigation.ts -> getRouteInfo] ENTER. Определение маршрута');
  const rawHash = window.location.hash;
  const rawPath = window.location.pathname;
  const dataPath = document.body.getAttribute('data-path');
  const hasSettingsClass = hasSettingsPageClass();
  
  console.log(`[navigation.ts -> getRouteInfo] Параметры: hash="${rawHash}", path="${rawPath}", dataPath="${dataPath}", hasSettingsClass=${hasSettingsClass}`);
  
  let hash = null;
  if (rawHash && rawHash.startsWith('#/')) {
    hash = rawHash.substring(2); // Без '#/'
    console.log(`[navigation.ts -> getRouteInfo] Извлечен хэш: "${hash}"`);
  }
  
  // Самый точный и высокоприоритетный способ определения - проверка класса settings-page
  if (hasSettingsClass) {
    console.log('[navigation.ts -> getRouteInfo] Определено по классу settings-page: страница настроек');
    return {
      path: SETTINGS_ROUTE,
      isSettings: true,
      isIndex: false,
      rawHash,
      rawPath,
      dataPath,
      hasSettingsClass,
      hash
    };
  }
  
  // Второй приоритет - прямая проверка хеша для страницы настроек
  if (rawHash === '#/settings') {
    console.log('[navigation.ts -> getRouteInfo] Определено по хэшу #/settings: страница настроек');
    return {
      path: SETTINGS_ROUTE,
      isSettings: true,
      isIndex: false,
      rawHash,
      rawPath,
      dataPath,
      hasSettingsClass,
      hash
    };
  }
  
  // Третий приоритет - проверка атрибута data-path
  if (dataPath === '/settings') {
    console.log('[navigation.ts -> getRouteInfo] Определено по data-path=/settings: страница настроек');
    return {
      path: SETTINGS_ROUTE,
      isSettings: true,
      isIndex: false,
      rawHash,
      rawPath,
      dataPath,
      hasSettingsClass,
      hash
    };
  }
  
  // Определяем путь для других страниц
  let path = '';
  
  // Первый приоритет - хеш для HashRouter
  if (hash) {
    path = hash;
    console.log(`[navigation.ts -> getRouteInfo] Определен путь из хэша: "${path}"`);
  } 
  // Второй приоритет - атрибут data-path
  else if (dataPath) {
    path = dataPath;
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    console.log(`[navigation.ts -> getRouteInfo] Определен путь из data-path: "${path}"`);
  }
  // Последний приоритет - pathname
  else {
    path = rawPath;
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    console.log(`[navigation.ts -> getRouteInfo] Определен путь из pathname: "${path}"`);
  }
  
  // Определяем тип маршрута
  const isSettings = path === SETTINGS_ROUTE;
  const isIndex = !path || path === '' || path === 'index';
  
  console.log(`[navigation.ts -> getRouteInfo] EXIT. path="${path}", isSettings=${isSettings}, isIndex=${isIndex}`);
  
  return {
    path,
    isSettings,
    isIndex,
    rawHash,
    rawPath,
    dataPath,
    hasSettingsClass,
    hash
  };
};

/**
 * Функция для нормализации маршрута для отображения в логах
 * @returns Нормализованное представление текущего маршрута
 */
export const getNormalizedRouteForLogging = (): string => {
  const { path, isIndex, isSettings, rawHash, rawPath, dataPath, hasSettingsClass } = getRouteInfo();
  
  return `route=${path} (isIndex=${isIndex}, isSettings=${isSettings}, hash=${rawHash}, path=${rawPath}, dataPath=${dataPath || 'null'}, hasSettingsClass=${hasSettingsClass})`;
};
