
import { useEffect } from 'react';
import { useSearchState } from './useSearchState';
import { useSearchActions } from './useSearchActions';

// Вспомогательная функция для определения страницы настроек
const isOnSettingsPage = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname === "/settings" || 
         window.location.pathname.endsWith("/settings") || 
         window.location.hash === "#/settings" || 
         window.location.hash.includes("/settings") ||
         document.body.getAttribute('data-path') === '/settings';
};

export function useSearchLogic() {
  // Получаем все состояния поиска из нашего кастомного хука
  const searchState = useSearchState();
  
  // Получаем все действия поиска из нашего кастомного хука
  const searchActions = useSearchActions(searchState);
  
  // Проверяем, находимся ли мы на странице настроек
  const inSettingsPage = isOnSettingsPage();
  
  // Эффект для очистки
  useEffect(() => {
    // Не выполняем логику поиска и очистки на странице настроек
    if (!inSettingsPage) {
      return searchActions.cleanupSearch;
    }
    return () => {}; // Пустая функция очистки для страницы настроек
  }, [inSettingsPage, searchActions]);

  // Возвращаем все состояния и действия как единый объект
  return {
    ...searchState,
    ...searchActions,
    isOnSettingsPage: inSettingsPage
  };
}
