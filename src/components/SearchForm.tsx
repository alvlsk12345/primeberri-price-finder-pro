
import React, { KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

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
  // Обработчик нажатия клавиши Enter
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      handleSearch();
      e.preventDefault(); // Предотвращаем стандартное поведение формы
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Введите название товара, например, кожаная сумка, кроссовки Nike..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        className="flex-grow"
      />
      <Button 
        onClick={handleSearch} 
        disabled={isLoading || !searchQuery}
        className="min-w-[200px]"
      >
        {isLoading ? (
          <span>Поиск...</span>
        ) : (
          <span className="flex items-center gap-2">
            <Search size={18} /> Поиск
          </span>
        )}
      </Button>
    </div>
  );
};
