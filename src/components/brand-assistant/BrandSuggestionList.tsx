
import React from "react";
import { BrandSuggestionItem } from "./BrandSuggestionItem";
import { BrandSuggestion } from "@/services/types";

interface BrandSuggestionListProps {
  suggestions: BrandSuggestion[];
  onSelect: (product: string, performSearch?: boolean) => void;
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

  // Нормализация результатов: если получен один объект вместо массива,
  // преобразуем его в массив с одним элементом
  const normalizedSuggestions = Array.isArray(suggestions) 
    ? suggestions 
    : [suggestions];

  return (
    <div className="mt-4 p-3 bg-slate-50 rounded-md border">
      <h3 className="text-sm font-medium mb-3">
        Рекомендуемые товары ({normalizedSuggestions.length}):
      </h3>
      <div className="space-y-3">
        {normalizedSuggestions.map((suggestion, index) => {
          // Проверка наличия необходимых полей
          if (!suggestion.brand && !suggestion.name) {
            console.warn(`Предложение #${index} не содержит имя бренда:`, suggestion);
            return null; // Не отображаем некорректные элементы
          }
          
          return (
            <BrandSuggestionItem 
              key={index} 
              suggestion={suggestion} 
              onSelect={(immediate) => {
                // Определяем значение для поиска на основе доступных данных
                const brand = suggestion.brand || suggestion.name || '';
                const product = suggestion.product || '';
                    
                // Формируем поисковый запрос с брендом и продуктом
                const searchTerm = brand && product 
                  ? `${brand} ${product}` 
                  : (brand || product || "");
                    
                console.log(`Выбран бренд: ${brand}, товар: ${product}, поисковый запрос: ${searchTerm}`);
                onSelect(searchTerm, immediate);
              }} 
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
};
