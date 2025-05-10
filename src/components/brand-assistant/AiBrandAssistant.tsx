import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { useSearch } from "@/contexts/SearchContext";
import { containsCyrillicCharacters } from '@/services/translationService';

// Импортируем функцию из сервиса-фасада вместо прямого импорта из openai
import { fetchBrandSuggestions } from "@/services/productFormatter";

export const AiBrandAssistant: React.FC = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [suggestions, setSuggestions] = useState<{ brand: string; product: string; description: string; imageUrl?: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!searchQuery || searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      // Проверяем, содержит ли запрос кириллицу
      if (containsCyrillicCharacters(searchQuery)) {
        console.log('Запрос содержит кириллицу, предложения брендов не будут загружены.');
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedSuggestions = await fetchBrandSuggestions(searchQuery);
        setSuggestions(fetchedSuggestions);
      } catch (e: any) {
        setError(e.message || 'Ошибка при загрузке предложений');
        toast.error(e.message || 'Ошибка при загрузке предложений', {
          duration: 3000
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Задержка перед выполнением запроса
    const timeoutId = setTimeout(() => {
      loadSuggestions();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, setSearchQuery]);

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
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Загрузка предложений...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">
        <AlertCircle size={14} className="inline-block mr-1 align-text-bottom" />
        {error}
      </div>;
  }

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Возможно, вы искали:</h4>
      <div className="flex flex-wrap gap-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="p-2 bg-white rounded border cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => handleSelectProduct(suggestion.product)}>
            {suggestion.imageUrl && (
              <img src={suggestion.imageUrl} alt={suggestion.brand} className="w-24 h-20 object-contain mb-2 rounded" />
            )}
            <p className="font-medium text-sm">{suggestion.brand}</p>
            <p className="text-sm">{suggestion.product}</p>
            <p className="text-xs text-gray-500">{suggestion.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
