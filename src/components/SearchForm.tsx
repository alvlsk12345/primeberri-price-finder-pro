import React, { KeyboardEvent, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { toast } from "sonner";
import { useDemoModeForced } from '@/services/api/mock/mockServiceConfig';
import { containsCyrillicCharacters } from '@/services/translationService';
import { AiBrandAssistant } from './brand-assistant/AiBrandAssistant';
import { testMinimalGoogleApiRequest } from '@/services/api/googleSearchService';
import { callOpenAI } from '@/services/api/openai';
import { hasValidApiKey } from '@/services/api/openai';

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
  const [isTesting, setIsTesting] = useState(false);
  const [openAiStatus, setOpenAiStatus] = useState<'неизвестно' | 'работает' | 'ошибка'>('неизвестно');
  const isDemoMode = useDemoModeForced;
  const MODEL_NAME = "gpt-4o-search-preview-2025-03-11"; // Добавляем константу для отображения названия модели

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

  // Тест OpenAI API для проверки работоспособности
  const testOpenAiApi = async () => {
    try {
      setIsTesting(true);
      
      if (!hasValidApiKey()) {
        toast.error("API ключ OpenAI не установлен или имеет неверный формат", {
          duration: 5000,
          description: "Добавьте ключ в настройках приложения"
        });
        setOpenAiStatus('ошибка');
        return;
      }
      
      toast.loading("Тестирование OpenAI API...");
      
      const response = await callOpenAI("Ответь одним словом: Работает?", {
        temperature: 0.1,
        max_tokens: 50,
        model: MODEL_NAME // Используем константу вместо жестко закодированного значения
      });
      
      if (response && typeof response === 'string') {
        console.log("Ответ от OpenAI API:", response);
        toast.success(`Тест OpenAI API успешен! Ответ: ${response}`, {
          duration: 5000,
          description: `Используется модель: ${MODEL_NAME}`
        });
        setOpenAiStatus('работает');
      } else {
        throw new Error("Некорректный ответ от API");
      }
    } catch (error) {
      console.error("Ошибка при тестировании OpenAI API:", error);
      toast.error(`Ошибка OpenAI API: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, {
        duration: 5000
      });
      setOpenAiStatus('ошибка');
    } finally {
      setIsTesting(false);
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

      <div className="pt-3 flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            const result = await testMinimalGoogleApiRequest();
            toast.info(`Тест Google API: ${result}`, { duration: 7000 });
          }}
          size="sm"
          variant="outline"
          className="text-xs"
          type="button"
        >
          Тест Google API
        </Button>
        
        <Button
          onClick={testOpenAiApi}
          size="sm"
          variant={openAiStatus === 'работает' ? "outline" : "secondary"}
          className={`text-xs flex items-center gap-1 ${
            openAiStatus === 'работает' ? 'border-green-500 text-green-700' : 
            openAiStatus === 'ошибка' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''
          }`}
          disabled={isTesting}
          type="button"
        >
          {isTesting ? (
            <>
              <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-1" />
              Тестирование...
            </>
          ) : (
            <>
              <RefreshCw size={14} />
              Тест OpenAI API {openAiStatus !== 'неизвестно' ? 
                `(${openAiStatus === 'работает' ? '✓' : '✗'})` : ''}
            </>
          )}
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className="text-xs flex items-center gap-1 text-muted-foreground"
          onClick={() => toast.info(`Используется модель: ${MODEL_NAME}`, { 
            description: "Модель оптимизирована для поисковых запросов" 
          })}
        >
          <Info size={14} />
          Инфо о модели
        </Button>
      </div>

      <AiBrandAssistant onSelectProduct={(product, performSearch) => {
        handleSelectProduct(product, performSearch);
      }} />
    </div>
  );
};
