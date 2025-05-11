
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
  console.log("Отрисовка BrandSuggestionList с данными:", suggestions);
  
  // Проверка на пустой массив или отсутствие данных
  if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
    console.warn("BrandSuggestionList: получен пустой или неверный массив предложений", suggestions);
    return (
      <div className="mt-4 p-3 bg-slate-50 rounded-md border">
        <p className="text-sm text-gray-500">Нет предложений по брендам для данного запроса.</p>
      </div>
    );
  }

  // Проверяем, имеет ли suggestions свойство products или нужно работать напрямую с массивом предложений
  let normalizedSuggestions: BrandSuggestion[] = suggestions;
  
  // Проверяем, если suggestions - не массив, а объект с products полем
  if (!Array.isArray(suggestions) && suggestions.products && Array.isArray(suggestions.products)) {
    normalizedSuggestions = suggestions.products;
    console.log("Нормализация: извлечены продукты из объекта", normalizedSuggestions);
  }
  
  // Если это все еще не массив, преобразуем в массив
  if (!Array.isArray(normalizedSuggestions)) {
    normalizedSuggestions = [normalizedSuggestions];
    console.log("Нормализация: объект преобразован в массив", normalizedSuggestions);
  }
  
  console.log("Нормализованные предложения:", normalizedSuggestions);

  return (
    <div className="mt-4 p-3 bg-slate-50 rounded-md border">
      <h3 className="text-sm font-medium mb-3">
        Рекомендуемые товары ({normalizedSuggestions.length}):
      </h3>
      <div className="space-y-3">
        {normalizedSuggestions.map((suggestion, index) => {
          // Проверка наличия необходимых полей
          if (!suggestion || (!suggestion.brand && !suggestion.name)) {
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
