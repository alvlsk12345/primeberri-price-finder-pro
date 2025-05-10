import React, { KeyboardEvent, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { useDemoModeForced } from '@/services/api/mock/mockServiceConfig';
import { containsCyrillicCharacters } from '@/services/translationService';
import { AiBrandAssistant } from './brand-assistant/AiBrandAssistant';
import { testMinimalGoogleApiRequest } from '@/services/api/googleSearchService';

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
  const isDemoMode = useDemoModeForced;

  // Диагностический тест API при первом рендере
  useEffect(() => {
    const testGoogleApi = async () => {
      console.log('Выполнение диагностического теста Google API...');
      try {
        const result = await testMinimalGoogleApiRequest();
        console.log('Результат диагностического теста Google API:', result);
        
        // Показываем тост с результатом теста для большей заметности
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
    console.log('1. О��кройте инструменты разработчика (F12 или Ctrl+Shift+I)');
    console.log('2. Перейдите на вкладку "Сеть" (Network)');
    console.log('3. Найдите запросы к googleapis.com');
    console.log('4. Проверьте статус запроса (должен быть 200)');
    console.log('5. Проверьте ответ запроса на наличие данных');
    console.log('--------------------------------------------');
  }, []);

  // Обработчик нажатия клавиши Enter
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      executeSearch();
      e.preventDefault(); // Предотвращаем стандартное поведение формы
    }
  };

  // Функция выполнения поиска с дополнительными проверками
  const executeSearch = () => {
    try {
      if (!searchQuery.trim()) {
        toast.error('Пожалуйста, введите запрос для поиска');
        return;
      }
      setHasError(false);

      // Дополнительное уведомление для отладки
      toast.info('Выполняем поиск через Zylalabs API', {
        duration: 2000
      });
      handleSearch();
    } catch (error) {
      console.error('Ошибка при попытке поиска:', error);
      setHasError(false); // Reset error state to prevent UI hanging
      toast.error('Произошла ошибка при поиске. Пожалуйста, попробуйте снова.');
    }
  };

  // Обновлено для включения бренда в поисковый запрос
  const handleSelectProduct = (product: string, performSearch: boolean = false) => {
    // Находим выбранный товар из AI-помощника по компонентам
    const componentElements = document.querySelectorAll('.p-2.bg-white.rounded.border');
    let brandName = '';
    
    componentElements.forEach((element) => {
      const productElement = element.querySelector('p.text-sm');
      if (productElement && productElement.textContent === product) {
        const brandElement = element.querySelector('p.font-medium');
        if (brandElement) {
          brandName = brandElement.textContent || '';
        }
      }
    });
    
    // Формируем запрос, включая бренд, если он найден
    const searchTerm = brandName ? `${brandName} ${product}` : product;
    setSearchQuery(searchTerm);
    
    toast.info(`Товар "${searchTerm}" добавлен в поле поиска`, {
      duration: 2000
    });
    
    // Если требуется выполнить поиск сразу после выбора продукта
    if (performSearch) {
      setTimeout(() => {
        executeSearch();
      }, 500); // Небольшая задержка для лучшего UX
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-grow relative">
          <Input 
            placeholder="Введите название товара, например, кожаная сумка, кроссовки Nike..." 
            value={searchQuery} 
            onChange={e => {
              setSearchQuery(e.target.value);
              if (hasError) setHasError(false);
            }} 
            onKeyDown={handleKeyPress} 
            className={`w-full ${hasError ? 'border-red-500' : ''}`} 
          />
        </div>
        <Button 
          onClick={executeSearch} 
          disabled={isLoading || !searchQuery.trim()} 
          className="min-w-[200px]" 
          variant="brand"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-brand-foreground border-t-transparent rounded-full" />
              Поиск...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search size={18} /> Поиск
            </span>
          )}
        </Button>
      </div>
      
      {hasError && (
        <div className="flex items-center text-red-500 text-sm gap-1">
          <AlertCircle size={14} />
          <span>Произошла ошибка при поиске. Пожалуйста, попробуйте еще раз.</span>
        </div>
      )}

      <div className="pt-3">
        <Button
          onClick={async () => {
            const result = await testMinimalGoogleApiRequest();
            toast.info(`Тестовый запрос Google API: ${result}`, { duration: 7000 });
          }}
          size="sm"
          variant="outline"
          className="text-xs"
          type="button"
        >
          Тест Google API
        </Button>
      </div>

      <AiBrandAssistant onSelectProduct={(product, performSearch) => {
        handleSelectProduct(product, performSearch);
      }} />
    </div>
  );
};
