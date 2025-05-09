
import React, { KeyboardEvent, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from 'lucide-react';
import { toast } from "@/components/ui/sonner";

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
      setHasError(true);
      toast.error('Произошла ошибка при поиске. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Введите название товара, например, кожаная сумка, кроссовки Nike..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (hasError) setHasError(false);
          }}
          onKeyDown={handleKeyPress}
          className={`flex-grow ${hasError ? 'border-red-500' : ''} rounded-full px-6 py-6 border-2 focus-visible:ring-brand-red`}
        />
        <Button 
          onClick={executeSearch} 
          disabled={isLoading || !searchQuery.trim()}
          className="min-w-[150px] rounded-full bg-brand-red hover:bg-brand-red/90 px-6 py-6"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
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
    </div>
  );
};
