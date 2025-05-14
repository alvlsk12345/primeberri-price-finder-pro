
/**
 * Функции для определения текущего маршрута и страницы настроек
 * Централизованная утилита для использования во всем приложении
 */

// Для дополнительной защиты от ошибок при определении маршрута
const SETTINGS_ROUTE = 'settings';
const INDEX_ROUTE = '';

/**
 * Функция для безопасной проверки доступности localStorage
 * @returns true если localStorage доступен, false в противном случае
 */
export function isLocalStorageAvailable(): boolean {
  try {
    console.log('[navigation.ts] Проверка доступности localStorage');
    const testKey = '__test_navigation_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('[navigation.ts] localStorage недоступен:', e);
    return false;
  }
}

/**
 * Функция для проверки, находится ли пользователь на странице настроек
 * С дополнительными проверками для повышения надежности
 */
export const isOnSettingsPage = (): boolean => {
  console.log(`[navigation.ts -> isOnSettingsPage] ENTER. hash: "${window.location.hash}", pathname: "${window.location.pathname}", data-path: "${document.body.getAttribute('data-path')}"`);
  
  if (typeof window === 'undefined') return false;
  
  // Проверяем все возможные способы определения страницы settings
  
  // Способ 1: Проверка класса на body
  if (document.body.classList.contains('settings-page')) {
    console.log('[navigation.ts] Определено по классу settings-page: страница настроек');
    return true;
  }
  
  // Способ 2: Проверка хеша
  if (window.location.hash === '#/settings') {
    console.log('[navigation.ts] Определено по хешу: страница настроек');
    return true;
  }
  
  // Способ 3: Проверка data-path атрибута
  if (document.body.getAttribute('data-path') === '/settings') {
    console.log('[navigation.ts] Определено по data-path: страница настроек');
    return true;
  }
  
  // Способ 4: Полная информация о маршруте через getRouteInfo
  const routeInfo = getRouteInfo();
  const result = routeInfo.isSettings;
  
  console.log(`[navigation.ts -> isOnSettingsPage] EXIT. Result: ${result}`);
  return result;
};

/**
 * Функция для получения текущего маршрута в формате, совместимом с HashRouter
 * Возвращает путь без начального слеша для использования с HashRouter
 * С дополнительной обработкой ошибок
 */
export const getCurrentRoute = (): string => {
  try {
    if (typeof window === 'undefined') return '';
    
    // Извлекаем маршрут из хеша (для HashRouter)
    const hash = window.location.hash;
    if (hash.startsWith('#/')) {
      return hash.substring(2); // Убираем '#/'
    }
    
    return '';
  } catch (e) {
    console.error('[navigation.ts] Ошибка в getCurrentRoute:', e);
    return '';
  }
};

/**
 * Проверяет наличие класса settings-page в body
 * Это дополнительная проверка, которая делает определение страницы настроек более надежным
 */
const hasSettingsPageClass = (): boolean => {
  try {
    return document.body.classList.contains('settings-page');
  } catch (e) {
    console.error('[navigation.ts] Ошибка при проверке класса settings-page:', e);
    return false;
  }
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
  
  let rawHash = '';
  let rawPath = '';
  let dataPath: string | null = null;
  let hasSettingsClass = false;
  
  try {
    // Безопасно получаем информацию о маршруте
    rawHash = window.location.hash || '';
    rawPath = window.location.pathname || '';
    
    try {
      dataPath = document.body.getAttribute('data-path');
    } catch (e) {
      console.warn('[navigation.ts] Не удалось получить data-path:', e);
    }
    
    try {
      hasSettingsClass = hasSettingsPageClass();
    } catch (e) {
      console.warn('[navigation.ts] Не удалось проверить класс settings-page:', e);
    }
  } catch (e) {
    console.error('[navigation.ts] Ошибка при получении базовой информации о маршруте:', e);
  }
  
  console.log(`[navigation.ts -> getRouteInfo] Параметры: hash="${rawHash}", path="${rawPath}", dataPath="${dataPath}", hasSettingsClass=${hasSettingsClass}`);
  
  let hash = null;
  try {
    if (rawHash && rawHash.startsWith('#/')) {
      hash = rawHash.substring(2); // Без '#/'
      console.log(`[navigation.ts -> getRouteInfo] Извлечен хэш: "${hash}"`);
    }
  } catch (e) {
    console.error('[navigation.ts] Ошибка при извлечении хэша:', e);
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
  
  try {
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
  } catch (e) {
    console.error('[navigation.ts] Ошибка при определении пути:', e);
    path = ''; // По умолчанию - индексная страница
  }
  
  // Определяем тип маршрута
  let isSettings = false;
  let isIndex = false;
  
  try {
    isSettings = path === SETTINGS_ROUTE;
    isIndex = !path || path === '' || path === 'index';
  } catch (e) {
    console.error('[navigation.ts] Ошибка при определении типа маршрута:', e);
  }
  
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
  try {
    const { path, isIndex, isSettings, rawHash, rawPath, dataPath, hasSettingsClass } = getRouteInfo();
    
    return `route=${path} (isIndex=${isIndex}, isSettings=${isSettings}, hash=${rawHash}, path=${rawPath}, dataPath=${dataPath || 'null'}, hasSettingsClass=${hasSettingsClass})`;
  } catch (e) {
    console.error('[navigation.ts] Ошибка при нормализации маршрута для логирования:', e);
    return 'route=ERROR_RETRIEVING';
  }
};

/**
 * Устанавливает все необходимые атрибуты для страницы настроек
 * Используется для обеспечения консистентности страницы
 */
export const ensureSettingsPageAttributes = (): void => {
  try {
    console.log('[navigation.ts] Устанавливаем атрибуты для страницы настроек');
    document.body.classList.add('settings-page');
    document.body.setAttribute('data-path', '/settings');
  } catch (e) {
    console.error('[navigation.ts] Ошибка при установке атрибутов страницы настроек:', e);
  }
};
