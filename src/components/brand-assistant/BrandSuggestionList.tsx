import React, { useState, useEffect } from 'react';
import { BrandSuggestion } from '@/services/types';
import { BrandSuggestionItem } from './BrandSuggestionItem';
import { Skeleton } from "@/components/ui/skeleton";
import { fetchBrandSuggestions } from '@/services/api/brandSuggestionService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/services/translationService';
import { toast } from "sonner";

interface BrandSuggestionListProps {
  searchDescription: string;
  onSelectProduct: (searchQuery: string, immediate?: boolean) => void;
}

export const BrandSuggestionList: React.FC<BrandSuggestionListProps> = ({ 
  searchDescription, 
  onSelectProduct 
}) => {
  const [suggestions, setSuggestions] = useState<BrandSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (searchDescription) {
      loadSuggestions(searchDescription);
    } else {
      setSuggestions([]);
      setError(null);
    }
  }, [searchDescription, t]);

  const loadSuggestions = async (description: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBrandSuggestions(description);
      setSuggestions(data);
    } catch (e: any) {
      console.error("Ошибка при загрузке предложений:", e);
      setError(t("Ошибка при загрузке предложений. Пожалуйста, попробуйте позже."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (searchDescription) {
      loadSuggestions(searchDescription);
    }
  };

  // Функция для выбора продукта из списка
  const handleSelectProduct = (suggestion: BrandSuggestion, immediate: boolean = false) => {
    const searchQuery = `${suggestion.brand} ${suggestion.product}`;
    onSelectProduct(searchQuery, immediate);
    
    toast.success(`Выбран товар для поиска: ${suggestion.brand} ${suggestion.product}`, {
      duration: 2000,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t("Рекомендованные товары")}
        </h2>
        {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-md overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md flex items-center gap-4">
          <AlertTriangle className="text-red-500 w-8 h-8" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">Не удалось загрузить предложения</h3>
            <p className="text-sm text-red-700">
              Произошла ошибка при загрузке предложений. Пожалуйста, попробуйте снова позже.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={handleRetry}
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Попробовать снова
            </Button>
          </div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Нет предложений по вашему запросу. Попробуйте изменить описание.</p>
        </div>
      ) : (
        <ScrollArea className="h-full max-h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
