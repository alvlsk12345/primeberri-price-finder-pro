import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useDemoModeForced } from '@/services/api/mock/mockServiceConfig';
import { containsCyrillicCharacters } from '@/services/translationService';
import { AiBrandAssistant } from './brand-assistant/AiBrandAssistant';
import { testMinimalGoogleApiRequest } from '@/services/api/googleSearchService';
import { SearchInput } from './search/SearchInput';
import { SearchErrorMessage } from './search/SearchErrorMessage';
import { useProductSelectionHandler } from './search/ProductSelectionHandler';
import { NoResultsMessage } from './search/NoResultsMessage';
import { isSupabaseConnected } from '@/services/api/supabase/client';
import { isUsingSupabaseBackend } from '@/services/api/supabase/config';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';

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

  // Проверяем статус Supabase при загрузке
  useEffect(() => {
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
  }, []);

  // Диагностический тест API при первом рендере
  useEffect(() => {
    const testGoogleApi = async () => {
      console.log('Выполнение диагностического теста Google API...');
      try {
        const result = await testMinimalGoogleApiRequest();
        console.log('Результат диагностического теста Google API:', result);
        
        if (result.includes('успешен')) {
          toast.success('Диагностический тест Google API успешен!', { duration: 5000 });
        } else {
          toast.error(`Проблема с Google API: ${result}`, { duration: 7000 });
        }
      } catch (error) {
        console.error('Ошибка при выполнении диагностического теста:', error);
        toast.error('Ошибка при диагностике Google API. Проверьте консоль.', { duration: 5000 });
      }
    };
    
    // Запускаем тест при загрузке компонента
    testGoogleApi();
    
    // Выводим инструкции для отладки в браузере
    console.log('------- ИНСТРУКЦИИ ПО ОТЛАДКЕ GOOGLE API -------');
    console.log('1. Откройте инструменты разработчика (F12 или Ctrl+Shift+I)');
    console.log('2. Перейдите на вкладку "Сеть" (Network)');
    console.log('3. Найдите запросы к googleapis.com');
    console.log('4. Проверьте ст��тус запроса (должен быть 200)');
    console.log('5. Проверьте ответ запроса на наличие данных');
    console.log('--------------------------------------------');
  }, []);

  // Функция выполнения поиска с дополнительными проверками
  const executeSearch = () => {
    try {
      if (!searchQuery.trim()) {
        toast.error('Пожалуйста, введите запрос для поиска');
        return;
      }
      
      // Сбрасываем состояние ошибки перед новым поиском
      setHasError(false);
      setErrorMessage("");

      // Дополнительное уведомление для отладки
      toast.info('Выполняем поиск товаров', {
        duration: 2000
      });
      
      console.log('Запуск поиска с запросом:', searchQuery);
      handleSearch();
    } catch (error: any) {
      console.error('Ошибка при попытке поиска:', error);
      setHasError(true);
      setErrorMessage(error?.message || 'Произошла ошибка при поиске. Пожалуйста, попробуйте снова.');
      toast.error('Произошла ошибка при поиске. Подробности в консоли.');
    }
  };

  // Используем обновленный хук для обработки выбора продуктов
  const { handleSelectProduct } = useProductSelectionHandler(setSearchQuery, executeSearch);

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
      
      {/* Статус Supabase */}
      {(!supabaseStatus.connected || !supabaseStatus.enabled) && (
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
