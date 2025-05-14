
/**
 * Функция для проверки, находится ли пользователь на странице настроек
 * Централизованная утилита для использования во всем приложении
 */
export const isOnSettingsPage = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hash = window.location.hash;
  // Для HashRouter основная проверка должна быть по хешу
  if (hash === '#/settings' || hash.startsWith('#/settings?')) {
    return true;
  }

  // Запасные проверки (менее надежны во время быстрых переходов)
  const pathname = window.location.pathname;
  if (pathname === "/settings" || pathname.endsWith("/settings")) {
     return true;
  }

  // Проверка атрибута data-path на body
  const dataPath = document.body.getAttribute('data-path');
  if (dataPath === '/settings') {
    return true;
  }

  return false;
};
