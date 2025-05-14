
/**
 * Функции для определения текущего маршрута и страницы настроек
 * Централизованная утилита для использования во всем приложении
 */

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
  
  // Проверка hash (для HashRouter)
  if (window.location.hash) {
    if (window.location.hash.startsWith('#/')) {
      path = window.location.hash.substring(2); // Убираем '#/'
    }
  } else {
    // Проверка pathname (для BrowserRouter или прямого URL)
    path = window.location.pathname;
    if (path.startsWith('/')) {
      path = path.substring(1); // Стандартизируем формат пути
    }
  }
  
  // Проверка атрибута data-path если все еще нет информации
  if (!path && dataPath) {
    path = dataPath;
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
  }
  
  // Определяем конкретный маршрут
  const isSettings = path === 'settings';
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
