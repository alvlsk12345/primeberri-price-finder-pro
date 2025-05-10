
import React, { KeyboardEvent, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { useDemoModeForced } from '@/services/api/mock/mockServiceConfig';
import { containsCyrillicCharacters } from '@/services/translationService';
import { AiBrandAssistant } from './brand-assistant/AiBrandAssistant';

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

  const handleSelectProduct = (product: string, performSearch: boolean = false) => {
    setSearchQuery(product);
    toast.info(`Товар "${product}" добавлен в поле поиска`, {
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
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            
          </div>
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

      <AiBrandAssistant onSelectProduct={handleSelectProduct} />
    </div>
  );
};
