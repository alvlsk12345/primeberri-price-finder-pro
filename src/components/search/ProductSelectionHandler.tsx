
import React from 'react';
import { toast } from "sonner";

type ProductSelectionHandlerProps = {
  onSelectProduct: (product: string, performSearch?: boolean) => void;
};

export const useProductSelectionHandler = (
  setSearchQuery: (query: string) => void, 
  executeSearch: () => void
) => {
  // Обработчик выбора продукта из AI-помощника
  const handleSelectProduct = (product: string, performSearch: boolean = false) => {
    if (!product || typeof product !== 'string') {
      console.error('Некорректное значение товара:', product);
      toast.error('Не удалось выбрать товар: некорректные данные');
      return;
    }
    
    try {
      // Устанавливаем поисковый запрос
      setSearchQuery(product);
      
      console.log(`Товар "${product}" добавлен в поле поиска`);
      
      if (performSearch) {
        toast.info(`Начинаем поиск товара: ${product}`, {
          duration: 2000
        });
        
        // Небольшая задержка для лучшего UX
        setTimeout(() => {
          executeSearch();
        }, 300);
      } else {
        toast.info(`Товар "${product}" добавлен в поле поиска`, {
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Ошибка при выборе продукта:', error);
      toast.error('Не удалось обработать выбор товара. Попробуйте ввести запрос вручную.');
    }
  };

  return { handleSelectProduct };
};
