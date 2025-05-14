
import { useSearch } from "@/contexts/SearchContext";
import { useState, useEffect, useCallback } from "react";
import { containsCyrillicCharacters } from '@/services/translationService';

export const useProductSelectionHandler = (
  setSearchQuery: (query: string) => void, 
  executeSearch: () => void
) => {
  const { handleProductSelect } = useSearch();
  
  // Функция для обработки выбора продукта из AI-ассистента
  const handleSelectProduct = useCallback((productName: string) => {
    console.log(`Выбран продукт: ${productName}`);
    
    // Проверяем название на наличие кириллицы для правильного отображения
    if (containsCyrillicCharacters(productName)) {
      // Если название на русском - используем как есть
      setSearchQuery(productName);
    } else {
      // Если название на английском - добавляем кавычки для точного поиска
      setSearchQuery(`"${productName}"`);
    }
    
    // Задержка для того, чтобы пользователь увидел изменение в поле поиска
    setTimeout(() => {
      executeSearch();
    }, 300);
  }, [setSearchQuery, executeSearch]);

  return { handleSelectProduct };
};
