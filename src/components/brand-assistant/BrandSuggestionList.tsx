
import React from "react";
import { BrandSuggestionItem } from "./BrandSuggestionItem";
import { BrandSuggestion } from "@/services/types";

interface BrandSuggestionListProps {
  suggestions: BrandSuggestion[];
  onSelect: (product: string) => void;
}

export const BrandSuggestionList: React.FC<BrandSuggestionListProps> = ({ 
  suggestions, 
  onSelect 
}) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="mt-4 p-3 bg-slate-50 rounded-md border">
        <p className="text-sm text-gray-500">Нет предложений по брендам для данного запроса.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 bg-slate-50 rounded-md border">
      <h3 className="text-sm font-medium mb-2">Рекомендуемые товары:</h3>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => {
          // Проверка наличия необходимых полей
          if (!suggestion.brand && !suggestion.name) {
            console.warn(`Предложение #${index} не содержит имя бренда:`, suggestion);
            return null; // Не отображаем некорректные элементы
          }
          
          return (
            <BrandSuggestionItem 
              key={index} 
              suggestion={suggestion} 
              onSelect={() => {
                // Определяем значение для поиска на основе доступных данных
                // Поддерживаем оба формата данных
                const brand = suggestion.brand || suggestion.name || '';
                const product = suggestion.product || 
                  (Array.isArray(suggestion.products) && suggestion.products.length > 0 
                    ? suggestion.products[0] 
                    : '');
                    
                // Формируем поисковый запрос с брендом и продуктом
                const searchTerm = brand && product 
                  ? `${brand} ${product}` 
                  : (brand || product || "");
                    
                console.log(`Выбран бренд: ${brand}, товар: ${product}, поисковый запрос: ${searchTerm}`);
                onSelect(searchTerm);
              }} 
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
};
