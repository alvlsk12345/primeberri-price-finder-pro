
import { useEffect } from 'react';
import { useSearchState } from './useSearchState';
import { useSearchActions } from './useSearchActions';
import { isOnSettingsPage, getRouteInfo, getNormalizedRouteForLogging } from '@/utils/navigation';

export function useSearchLogic() {
  console.log(`[useSearchLogic] Инициализация хука useSearchLogic, текущий маршрут: ${getNormalizedRouteForLogging()}`);
  
  // Получаем все состояния поиска из нашего кастомного хука
  const searchState = useSearchState();
  
  // Получаем все действия поиска из нашего кастомного хука
  const searchActions = useSearchActions(searchState);
  
  // Проверяем, находимся ли мы на странице настроек, используя централизованную функцию
  const routeInfo = getRouteInfo();
  const inSettingsPage = routeInfo.isSettings;
  
  console.log(`[useSearchLogic] routeInfo = ${JSON.stringify(routeInfo)}, inSettingsPage = ${inSettingsPage}`);
  
  // Эффект для очистки - выполняем только если не на странице настроек
  useEffect(() => {
    console.log(`[useSearchLogic] useEffect выполняется, inSettingsPage = ${inSettingsPage}, маршрут: ${getNormalizedRouteForLogging()}`);
    
    // Защита от выполнения эффекта на странице настроек
    if (inSettingsPage) {
      console.log('[useSearchLogic] Пропускаем логику поиска на странице настроек');
      return () => {
        console.log('[useSearchLogic] Функция очистки для страницы настроек (пустая)');
      }; // Пустая функция очистки для страницы настроек
    }
    
    console.log('[useSearchLogic] Инициализация логики поиска на главной странице');
    
    // Возвращаем функцию очистки
    return () => {
      console.log('[useSearchLogic] Выполняем очистку логики поиска');
      if (searchActions.cleanupSearch) {
        searchActions.cleanupSearch();
      }
    };
  }, [inSettingsPage, searchActions]);

  // Возвращаем все состояния и действия как единый объект
  return {
    ...searchState,
    ...searchActions,
    isOnSettingsPage: inSettingsPage
  };
}
