
import React, { useState } from 'react';
import { toast } from "sonner";
import { BrandSuggestion } from '@/services/types';
import { BrandSuggestionItem } from './BrandSuggestionItem';
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BrandSuggestionListProps {
  searchDescription?: string;
  onSelect: (searchQuery: string, immediate?: boolean) => void;
  suggestions?: BrandSuggestion[];
}

export const BrandSuggestionList: React.FC<BrandSuggestionListProps> = ({ 
  searchDescription, 
  onSelect,
  suggestions = []
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для выбора продукта из списка
  const handleSelectProduct = (suggestion: BrandSuggestion, immediate: boolean = false) => {
    const brandName = suggestion.brand || suggestion.name || "";
    const productName = suggestion.product || "";
    const searchQuery = `${brandName} ${productName}`;
    
    console.log(`Выбираем товар для поиска: "${searchQuery}", immediate: ${immediate}`);
    
    // Показываем toast о начале поиска для лучшего UX
    if (immediate) {
      toast.loading(`Выполняем поиск: ${brandName} ${productName}`, {
        id: 'search-in-progress',
        duration: 3000
      });
    }
    
    // Вызываем функцию onSelect с правильными параметрами
    onSelect(searchQuery, immediate);
    
    toast.success(`Выбран товар для поиска: ${brandName} ${productName}`, {
      duration: 2000,
    });
    
    // Прокручиваем страницу к результатам поиска после выбора
    setTimeout(() => {
      const resultsElement = document.getElementById('search-results-section');
      if (resultsElement && immediate) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Рекомендованные товары
        </h2>
        {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-md overflow-hidden">
              <Skeleton className="h-28 w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
          <AlertTriangle className="text-red-500 w-6 h-6" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">Не удалось загрузить предложения</h3>
            <p className="text-sm text-red-700">
              Произошла ошибка при загрузке предложений. Пожалуйста, попробуйте снова позже.
            </p>
          </div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Нет предложений по вашему запросу. Попробуйте изменить описание.</p>
        </div>
      ) : (
        <ScrollArea className="h-full max-h-[600px] pr-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 pb-2">
            {suggestions.map((suggestion, index) => (
              <BrandSuggestionItem
                key={index}
                suggestion={suggestion}
                onSelect={(immediate) => handleSelectProduct(suggestion, immediate)}
                index={index}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
