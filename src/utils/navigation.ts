
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
} => {
  let path = '';
  const rawHash = window.location.hash;
  const rawPath = window.location.pathname;
  const dataPath = document.body.getAttribute('data-path');
  
  // Обновленная логика определения маршрута с приоритетом на хеш (для HashRouter)
  
  // Первый и самый высокий приоритет для страницы настроек - прямая проверка на '#/settings'
  if (rawHash === '#/settings') {
    return {
      path: SETTINGS_ROUTE,
      isSettings: true,
      isIndex: false,
      rawHash,
      rawPath,
      dataPath
    };
  }
  
  // Дополнительный приоритет - проверка класса settings-page
  if (hasSettingsPageClass()) {
    return {
      path: SETTINGS_ROUTE,
      isSettings: true,
      isIndex: false,
      rawHash,
      rawPath,
      dataPath
    };
  }
  
  // Проверка атрибутов data- для страницы настроек, которые устанавливаются компонентом Settings
  if (dataPath === '/settings') {
    return {
      path: SETTINGS_ROUTE,
      isSettings: true,
      isIndex: false,
      rawHash,
      rawPath,
      dataPath
    };
  }
  
  // Общий алгоритм определения пути для других страниц
  if (window.location.hash) {
    if (window.location.hash.startsWith('#/')) {
      path = window.location.hash.substring(2); // Убираем '#/'
    }
  } 
  // Второй приоритет - проверка атрибута data-path
  else if (dataPath) {
    path = dataPath;
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
  }
  // Последний приоритет - pathname (для BrowserRouter или прямого URL)
  else {
    path = window.location.pathname;
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
  }
  
  // Определяем конкретный маршрут с учетом всех факторов
  const isSettings = path === SETTINGS_ROUTE;
  const isIndex = !path || path === '' || path === 'index';
  
  return {
    path,
    isSettings,
    isIndex,
    rawHash,
    rawPath,
    dataPath
  };
};

/**
 * Функция для нормализации маршрута для отображения в логах
 * @returns Нормализованное представление текущего маршрута
 */
export const getNormalizedRouteForLogging = (): string => {
  const { path, isIndex, isSettings, rawHash, rawPath, dataPath } = getRouteInfo();
  
  return `route=${path} (isIndex=${isIndex}, isSettings=${isSettings}, hash=${rawHash}, path=${rawPath}, dataPath=${dataPath || 'null'})`;
};
