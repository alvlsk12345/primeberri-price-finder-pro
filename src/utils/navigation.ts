
/**
 * Функция для проверки, находится ли пользователь на странице настроек
 * Централизованная утилита для использования во всем приложении
 */
export const isOnSettingsPage = (): boolean => {
  console.log(`[navigation] Вызов isOnSettingsPage(). location.hash="${window.location.hash}", pathname="${window.location.pathname}", data-path="${document.body.getAttribute('data-path')}"`);
  
  if (typeof window === 'undefined') return false;
  
  // Проверка для HashRouter (основной способ маршрутизации в приложении)
  const hash = window.location.hash;
  if (hash === '#/settings' || hash.startsWith('#/settings?')) {
    console.log('[navigation] isOnSettingsPage(): true (по hash)');
    return true;
  }

  // Дополнительные проверки для совместимости
  const pathname = window.location.pathname;
  if (pathname === "/settings") {
    console.log('[navigation] isOnSettingsPage(): true (по pathname)');
    return true;
  }

  // Проверка атрибута data-path на body (самый надежный способ)
  const dataPath = document.body.getAttribute('data-path');
  if (dataPath === '/settings') {
    console.log('[navigation] isOnSettingsPage(): true (по data-path)');
    return true;
  }

  console.log('[navigation] isOnSettingsPage(): false (ни одно условие не сработало)');
  return false;
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
} => {
  let path = '';
  
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
  if (!path && document.body.getAttribute('data-path')) {
    path = document.body.getAttribute('data-path')!;
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
    isIndex
  };
};
