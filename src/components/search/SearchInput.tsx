
import React, { KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

type SearchInputProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  executeSearch: () => void;
  isLoading: boolean;
  hasError: boolean;
};

export const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  setSearchQuery,
  executeSearch,
  isLoading,
  hasError,
}) => {
  // Обработчик нажатия клавиши Enter
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      console.log('Enter нажат, выполняем поиск с запросом:', searchQuery);
      executeSearch();
      e.preventDefault();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Текст в поле поиска изменен:', e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    console.log('Кнопка поиска нажата, выполняем поиск с запросом:', searchQuery);
    executeSearch();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-grow relative">
        <Input 
          placeholder="Введите название товара, например, кожаная сумка, кроссовки Nike..." 
          value={searchQuery} 
          onChange={handleInputChange} 
          onKeyDown={handleKeyPress} 
          className={`w-full ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          aria-label="Поисковый запрос"
        />
      </div>
      <Button 
        onClick={handleSearchClick} 
        disabled={isLoading || !searchQuery.trim()} 
        className="min-w-[120px] sm:min-w-[200px]" 
        variant="brand"
        aria-label="Поиск товаров"
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
  );
};
