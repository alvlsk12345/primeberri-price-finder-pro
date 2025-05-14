
import { useEffect } from 'react';
import { useSearchState } from './useSearchState';
import { useSearchActions } from './useSearchActions';
import { isOnSettingsPage } from '@/utils/navigation';

export function useSearchLogic() {
  // Получаем все состояния поиска из нашего кастомного хука
  const searchState = useSearchState();
  
  // Получаем все действия поиска из нашего кастомного хука
  const searchActions = useSearchActions(searchState);
  
  // Проверяем, находимся ли мы на странице настроек, используя централизованную функцию
  const inSettingsPage = isOnSettingsPage();
  
  // Эффект для очистки - выполняем только если не на странице настроек
  useEffect(() => {
    // Защита от выполнения эффекта на странице настроек
    if (inSettingsPage) {
      console.log('Пропускаем логику поиска на странице настроек');
      return () => {}; // Пустая функция очистки для страницы настроек
    }
    
    console.log('Инициализация логики поиска');
    return searchActions.cleanupSearch;
  }, [inSettingsPage, searchActions]);

  // Возвращаем все состояния и действия как единый объект
  return {
    ...searchState,
    ...searchActions,
    isOnSettingsPage: inSettingsPage
  };
}
