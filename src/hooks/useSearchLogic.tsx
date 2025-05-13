
import { useEffect } from 'react';
import { useSearchState } from './useSearchState';
import { useSearchActions } from './useSearchActions';

export function useSearchLogic() {
  // Получаем все состояния поиска из нашего кастомного хука
  const searchState = useSearchState();
  
  // Получаем все действия поиска из нашего кастомного хука
  const searchActions = useSearchActions(searchState);
  
  // Эффект для очистки
  useEffect(() => {
    return searchActions.cleanupSearch;
  }, []);

  // Возвращаем все состояния и действия как единый объект
  return {
    ...searchState,
    ...searchActions
  };
}
