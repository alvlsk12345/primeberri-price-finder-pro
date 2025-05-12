
import React, { useEffect } from "react";
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
  
  // Добавляем эффект для дополнительного логирования
  useEffect(() => {
    console.log("BrandSuggestionList: получены данные", {
      тип: typeof suggestions,
      массив: Array.isArray(suggestions),
      количество: Array.isArray(suggestions) ? suggestions.length : 'не массив',
      содержимое: suggestions
    });
  }, [suggestions]);

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
    // Если suggestions уже массив, проверяем каждый элемент
    normalizedSuggestions = suggestions.filter(item => 
      item && (item.brand || item.name || item.product)
    ).map(item => ({
      brand: item.brand || item.name || "Неизвестный бренд",
      product: item.product || "",
      description: item.description || "Описание недоступно"
    }));
    console.log("Данные нормализованы из массива:", normalizedSuggestions);
  } else if (suggestions && typeof suggestions === 'object') {
    // Проверяем наличие поля products
    if ('products' in suggestions && Array.isArray((suggestions as BrandResponse).products)) {
      const productsArray = (suggestions as BrandResponse).products || [];
      normalizedSuggestions = productsArray.filter(item => 
        item && (item.brand || item.name || item.product)
      ).map(item => ({
        brand: item.brand || item.name || "Неизвестный бренд",
        product: item.product || "",
        description: item.description || "Описание недоступно"
      }));
      console.log("Извлечен и нормализован массив products из объекта:", normalizedSuggestions);
    } else {
      // Проверяем, есть ли необходимые поля для одиночного объекта
      if ('brand' in suggestions || 'name' in suggestions || 'product' in suggestions) {
        // Если это одиночный объект, преобразуем его в массив
        const item = suggestions as unknown as BrandSuggestion;
        normalizedSuggestions = [{
          brand: item.brand || item.name || "Неизвестный бренд",
          product: item.product || "",
          description: item.description || "Описание недоступно"
        }];
        console.log("Одиночный объект преобразован в массив:", normalizedSuggestions);
      }
    }
  }
  
  console.log("Окончательные нормализованные предложения:", normalizedSuggestions);

  // Если после нормализации массив пуст, показываем сообщение
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {normalizedSuggestions.map((suggestion, index) => {
          // Проверка наличия необходимых полей
          if (!suggestion || (!suggestion.brand && !suggestion.product)) {
            console.warn(`Предложение #${index} не содержит необходимых данных:`, suggestion);
            return null; // Не отображаем некорректные элементы
          }
          
          console.log(`Отрисовка элемента #${index}:`, suggestion);
          
          return (
            <BrandSuggestionItem 
              key={index} 
              suggestion={suggestion} 
              onSelect={(immediate) => {
                // Определяем значение для поиска на основе доступных данных
                const brand = suggestion.brand || "";
                const product = suggestion.product || "";
                    
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
