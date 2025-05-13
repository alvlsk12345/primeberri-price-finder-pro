
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useDemoModeForced } from '@/services/api/mock/mockServiceConfig';
import { containsCyrillicCharacters } from '@/services/translationService';
import { AiBrandAssistant } from './brand-assistant/AiBrandAssistant';
import { SearchInput } from './search/SearchInput';
import { SearchErrorMessage } from './search/SearchErrorMessage';
import { useProductSelectionHandler } from './search/ProductSelectionHandler';
import { NoResultsMessage } from './search/NoResultsMessage';
import { isSupabaseConnected } from '@/services/api/supabase/client';
import { isUsingSupabaseBackend } from '@/services/api/supabase/config';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';

// Функция для проверки, находимся ли мы на странице настроек
const isOnSettingsPage = () => {
  if (typeof window === 'undefined') return false;
  
  // Проверяем все возможные варианты URL страницы настроек
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  
  return pathname === "/settings" || 
         pathname.endsWith("/settings") || 
         hash === "#/settings" || 
         hash.includes("/settings");
};

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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; enabled: boolean }>({ 
    connected: false, 
    enabled: false 
  });
  const isDemoMode = useDemoModeForced;
  
  // Проверяем, находимся ли мы на странице настроек
  const inSettingsPage = isOnSettingsPage();

  // Проверяем статус Supabase при загрузке, но НЕ на странице настроек
  useEffect(() => {
    // Не выполняем проверку на странице настроек
    if (inSettingsPage) {
      console.log('Автоматическая проверка Supabase отключена на странице настроек');
      return;
    }
    
    const checkSupabaseStatus = async () => {
      const connected = await isSupabaseConnected();
      const enabled = await isUsingSupabaseBackend();
      setSupabaseStatus({ connected, enabled });
      
      console.log('Проверка статуса Supabase:', { connected, enabled });
      
      if (enabled && !connected) {
        toast.warning('Настройки используют Supabase Backend, но он не подключен. Некоторые функции могут быть недоступны.', 
                     { duration: 6000 });
      }
    };
    
    checkSupabaseStatus();
  }, [inSettingsPage]);

  // Функция выполнения поиска с дополнительными проверками и скроллингом
  const executeSearch = () => {
    try {
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
      
      console.log('Запуск поиска с запросом:', searchQuery);
      
      // Выполняем поиск
      handleSearch();
      
      // Добавляем скроллинг к результатам после завершения поиска
      // Увеличиваем время ожидания до 2.5 секунд для уверенности, что результаты загрузились
      setTimeout(() => {
        // Ищем элемент с результатами поиска
        const resultsElement = document.querySelector('.search-results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Закрываем всплывающее окно о поиске
        toast.dismiss('search-toast');
        toast.success('Поиск завершен', { duration: 1500 });
      }, 2500); // Увеличиваем задержку для гарантии загрузки результатов
    } catch (error: any) {
      console.error('Ошибка при попытке поиска:', error);
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
        
        <NoResultsMessage />
      </div>
    );
  }

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
      
      {/* Статус Supabase - отображаем только если НЕ на странице настроек */}
      {(!supabaseStatus.connected || !supabaseStatus.enabled) && !inSettingsPage && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
          <div className="flex items-start gap-2">
            <InfoIcon className="text-orange-600 mt-1 shrink-0" size={18} />
            <div>
              <p className="text-sm text-orange-800 font-medium mb-2">
                Внимание: Проблема с настройками Supabase
              </p>
              <p className="text-xs text-orange-700 mb-1">
                {!supabaseStatus.enabled 
                  ? 'Supabase Backend отключен в настройках. Некоторые функции будут недоступны.' 
                  : 'Supabase Backend включен, но соединение не установлено.'}
              </p>
              <p className="text-xs text-orange-700">
                Для корректной работы с OpenAI API необходимо настроить Supabase Backend.
              </p>
              <Button variant="outline" size="sm" className="mt-2 text-xs">
                <Link to="/settings">Перейти к настройкам</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <AiBrandAssistant onSelectProduct={handleSelectProduct} />
      
      <NoResultsMessage />
    </div>
  );
};
