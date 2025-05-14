
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useDemoModeForced } from '@/services/api/mock/mockServiceConfig';
import { containsCyrillicCharacters } from '@/services/translationService';
import { AiBrandAssistant } from './brand-assistant/AiBrandAssistant';
import { SearchInput } from './search/SearchInput';
import { SearchErrorMessage } from './search/SearchErrorMessage';
import { useProductSelectionHandler } from './search/ProductSelectionHandler';
import { NoResultsMessage } from './search/NoResultsMessage';
import { isSupabaseConnected, checkSupabaseConnection } from '@/services/api/supabase/client';
import { isUsingSupabaseBackend } from '@/services/api/supabase/config';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';
import { isOnSettingsPage, getRouteInfo } from '@/utils/navigation';
import { SupabaseStatusMessage } from './brand-assistant/SupabaseStatusMessage';

type SearchFormProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
};

export const SearchForm: React.FC<SearchFormProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isLoading
}) => {
  console.log('[SearchForm] Рендер SearchForm');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; enabled: boolean }>({ 
    connected: false, 
    enabled: false 
  });
  const isDemoMode = useDemoModeForced;
  
  // Проверяем, находимся ли мы на странице настроек, используя центральную функцию
  const routeInfo = getRouteInfo();
  const inSettingsPage = routeInfo.isSettings;
  
  console.log(`[SearchForm] routeInfo = ${JSON.stringify(routeInfo)}, inSettingsPage = ${inSettingsPage}`);

  // Устанавливаем атрибут data-path в body при загрузке компонента
  useEffect(() => {
    console.log('[SearchForm] useEffect - установка data-path');
    // Только если мы на странице настроек
    if (inSettingsPage) {
      console.log('[SearchForm] Установка data-path для страницы настроек');
      document.body.setAttribute('data-path', '/settings');
    }
    
    // Очистка при размонтировании
    return () => {
      console.log('[SearchForm] useEffect - очистка data-path');
      if (inSettingsPage) {
        document.body.removeAttribute('data-path');
      }
    };
  }, [inSettingsPage]);

  // Проверяем статус Supabase, но только если мы не на странице настроек
  useEffect(() => {
    console.log('[SearchForm] useEffect - проверка статуса Supabase');
    // Избегаем проверки статуса Supabase на странице настроек
    if (!inSettingsPage) {
      const checkSupabaseStatus = async () => {
        try {
          console.log('[SearchForm] Запуск проверки статуса Supabase');
          // Без логирования, чтобы не засорять консоль
          const connected = await isSupabaseConnected(false); 
          const enabled = await isUsingSupabaseBackend();
          console.log(`[SearchForm] Результат проверки: connected=${connected}, enabled=${enabled}`);
          setSupabaseStatus({ connected, enabled });
        } catch (error) {
          console.error('[SearchForm] Ошибка при проверке статуса Supabase:', error);
          setSupabaseStatus({ connected: false, enabled: false });
        }
      };
      
      // Добавляем таймаут, чтобы не блокировать рендеринг
      const timeoutId = setTimeout(() => {
        checkSupabaseStatus();
      }, 1000);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [inSettingsPage]);

  // Функция для повторной проверки соединения с Supabase
  const handleCheckSupabaseConnection = async () => {
    try {
      toast.loading('Проверка соединения с Supabase...');
      const connected = await checkSupabaseConnection(true); // с принудительной проверкой
      const enabled = await isUsingSupabaseBackend();
      
      setSupabaseStatus({ connected, enabled });
      
      if (connected) {
        toast.success('Соединение с Supabase успешно установлено');
      } else {
        toast.error('Не удалось установить соединение с Supabase');
      }
    } catch (error) {
      console.error('[SearchForm] Ошибка при проверке соединения:', error);
      toast.error('Произошла ошибка при проверке соединения');
    }
  };

  // Функция выполнения поиска с дополнительными проверками и скроллингом
  const executeSearch = () => {
    try {
      console.log('[SearchForm] Вызов executeSearch()');
      // Проверка на странице настроек
      if (inSettingsPage) {
        console.log("[SearchForm] executeSearch: Выполнение предотвращено на странице настроек");
        return;
      }
      
      if (!searchQuery.trim()) {
        toast.error('Пожалуйста, введите запрос для поиска');
        return;
      }
      
      // Сбрасываем состояние ошибки перед новым поиском
      setHasError(false);
      setErrorMessage("");

      // Добавляем всплывающее окно о поиске
      toast.loading('Идет поиск, пожалуйста подождите', {
        id: 'search-toast',
        duration: 0 // Бесконечная длительность, отменим вручную при получении результатов
      });
      
      // Выполняем поиск
      handleSearch();
      
      // Добавляем скроллинг к результатам после завершения поиска
      setTimeout(() => {
        // Повторно проверяем, не перешли ли мы на страницу настроек
        const currentRouteInfo = getRouteInfo();
        if (currentRouteInfo.isSettings) {
          toast.dismiss('search-toast');
          return;
        }
        
        // Ищем элемент с результатами поиска
        const resultsElement = document.querySelector('.search-results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Закрываем всплывающее окно о поиске
        toast.dismiss('search-toast');
        toast.success('Поиск завершен', { duration: 1500 });
      }, 2500);
    } catch (error: any) {
      console.error('[SearchForm] Ошибка при попытке поиска:', error);
      setHasError(true);
      setErrorMessage(error?.message || 'Произошла ошибка при поиске. Пожалуйста, попробуйте снова.');
      toast.dismiss('search-toast');
      toast.error('Произошла ошибка при поиске. Подробности в консоли.');
    }
  };

  // Используем обновленный хук для обработки выбора продуктов
  const { handleSelectProduct } = useProductSelectionHandler(setSearchQuery, executeSearch);

  // Если мы на странице настроек, показываем упрощенный компонент без проверок соединения
  if (inSettingsPage) {
    console.log('[SearchForm] Рендер упрощенного компонента для страницы настроек');
    return (
      <div className="space-y-4">
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          executeSearch={executeSearch}
          isLoading={isLoading}
          hasError={hasError}
        />
        
        <SearchErrorMessage hasError={hasError} errorMessage={errorMessage} />
      </div>
    );
  }

  console.log('[SearchForm] Рендер полного компонента для главной страницы');
  return (
    <div className="space-y-4">
      <SearchInput
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        executeSearch={executeSearch}
        isLoading={isLoading}
        hasError={hasError}
      />
      
      <SearchErrorMessage hasError={hasError} errorMessage={errorMessage} />
      
      {/* Используем компонент SupabaseStatusMessage с кнопкой проверки */}
      <SupabaseStatusMessage 
        connected={supabaseStatus.connected} 
        enabled={supabaseStatus.enabled}
        onRequestCheck={handleCheckSupabaseConnection}
      />
      
      <AiBrandAssistant onSelectProduct={handleSelectProduct} />
      
      <NoResultsMessage />
    </div>
  );
};
