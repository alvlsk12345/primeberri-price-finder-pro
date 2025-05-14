
/**
 * Функция для проверки, находится ли пользователь на странице настроек
 * Централизованная утилита для использования во всем приложении
 */
export const isOnSettingsPage = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Проверка для HashRouter (основной способ маршрутизации в приложении)
  const hash = window.location.hash;
  if (hash === '#/settings' || hash.startsWith('#/settings?')) {
    return true;
  }

  // Дополнительные проверки для совместимости
  const pathname = window.location.pathname;
  if (pathname === "/settings") {
    return true;
  }

  // Проверка атрибута data-path на body (самый надежный способ)
  const dataPath = document.body.getAttribute('data-path');
  if (dataPath === '/settings') {
    return true;
  }

  return false;
};
