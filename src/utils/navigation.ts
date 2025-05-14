
/**
 * Утилита для определения текущего местоположения в приложении
 */

/**
 * Проверяет, находится ли пользователь на странице настроек
 * Объединяет все способы проверки для максимальной надежности
 */
export const isOnSettingsPage = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Проверка хэша для HashRouter (наиболее надежная во время навигации)
  const hash = window.location.hash;
  if (hash === '#/settings' || hash.startsWith('#/settings?')) {
    return true;
  }

  // Проверка пути для обычной маршрутизации
  const pathname = window.location.pathname;
  if (pathname === "/settings" || pathname.endsWith("/settings")) {
    return true;
  }

  // Проверка атрибута data-path (может быть не установлен во время навигации)
  const dataPath = document.body.getAttribute('data-path');
  if (dataPath === '/settings') {
    return true;
  }

  return false;
};

/**
 * Проверяет, выполняется ли в данный момент переход на другую страницу
 * Полезно для предотвращения сетевых запросов во время навигации
 */
export const isNavigating = (): boolean => {
  // В будущем здесь может быть логика для отслеживания состояния навигации,
  // например, с использованием useTransition из React 18
  // Сейчас просто заглушка
  return false;
};
