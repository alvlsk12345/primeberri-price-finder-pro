
import React from "react";
import { BrandSuggestionItem } from "./BrandSuggestionItem";
import { BrandSuggestion, BrandResponse } from "@/services/types";

interface BrandSuggestionListProps {
  suggestions: BrandSuggestion[] | BrandResponse;
  onSelect: (product: string, performSearch?: boolean) => void;
}

export const BrandSuggestionList: React.FC<BrandSuggestionListProps> = ({ 
  suggestions, 
  onSelect 
}) => {
  console.log("Отрисовка BrandSuggestionList с данными:", suggestions);
  
  // Проверка на пустой массив или отсутствие данных
  if (!suggestions || (Array.isArray(suggestions) && suggestions.length === 0)) {
    console.warn("BrandSuggestionList: получен пустой или неверный массив предложений", suggestions);
    return (
      <div className="mt-4 p-3 bg-slate-50 rounded-md border">
        <p className="text-sm text-gray-500">Нет предложений по брендам для данного запроса.</p>
      </div>
    );
  }

  // Нормализация данных: преобразование различных форматов в массив BrandSuggestion
  let normalizedSuggestions: BrandSuggestion[] = [];
  
  if (Array.isArray(suggestions)) {
    // Если suggestions уже массив
    normalizedSuggestions = suggestions;
    console.log("Данные уже в формате массива:", normalizedSuggestions);
  } else if (suggestions && typeof suggestions === 'object') {
    // Проверяем наличие поля products
    if ('products' in suggestions && Array.isArray(suggestions.products)) {
      normalizedSuggestions = suggestions.products;
      console.log("Извлечен массив products из объекта:", normalizedSuggestions);
    } else {
      // Если это одиночный объект, преобразуем его в массив
      normalizedSuggestions = [suggestions as unknown as BrandSuggestion];
      console.log("Одиночный объект преобразован в массив:", normalizedSuggestions);
    }
  }
  
  console.log("Нормализованные предложения:", normalizedSuggestions);

  if (normalizedSuggestions.length === 0) {
    return (
      <div className="mt-4 p-3 bg-slate-50 rounded-md border">
        <p className="text-sm text-gray-500">Нет предложений по брендам для данного запроса.</p>
      </div>
    );
  }

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
