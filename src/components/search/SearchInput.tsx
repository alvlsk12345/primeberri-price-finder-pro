
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
      executeSearch();
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-grow relative">
        <Input 
          placeholder="Введите название товара, например, кожаная сумка, кроссовки Nike..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
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
  );
};
