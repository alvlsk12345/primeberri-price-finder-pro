
import React, { KeyboardEvent, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, Info } from 'lucide-react';
import { toast } from "@/components/ui/sonner";
import { useDemoModeForced } from '@/services/api/mockDataService';

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
      handleSearch();
    } catch (error) {
      console.error('Ошибка при попытке поиска:', error);
      setHasError(false); // Reset error state to prevent UI hanging
      toast.error('Произошла ошибка при поиске. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-grow relative">
          <Input
            placeholder="Введите название товара, например, кожаная сумка, кроссовки Nike..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (hasError) setHasError(false);
            }}
            onKeyDown={handleKeyPress}
            className={`w-full ${hasError ? 'border-red-500' : ''}`}
          />
          {useDemoModeForced && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded flex items-center">
                <Info size={12} className="mr-1" /> Демо-режим
              </span>
            </div>
          )}
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

      {useDemoModeForced && (
        <div className="flex items-center text-amber-600 text-sm gap-1 bg-amber-50 p-2 rounded">
          <Info size={14} />
          <span>Демонстрационный режим активен. Результаты поиска генерируются автоматически.</span>
        </div>
      )}
    </div>
  );
};
