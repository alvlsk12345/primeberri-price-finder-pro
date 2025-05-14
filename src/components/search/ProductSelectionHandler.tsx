
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";

type ProductSelectionHandlerProps = {
  onSelectProduct: (product: string, performSearch?: boolean) => void;
};

export const useProductSelectionHandler = (
  setSearchQuery: (query: string) => void, 
  executeSearch: () => void
) => {
  // Добавляем состояние для отслеживания необходимости поиска после обновления запроса
  const [pendingSearch, setPendingSearch] = useState<{query: string, shouldSearch: boolean} | null>(null);

  // Используем useEffect для выполнения поиска после обновления состояния
  useEffect(() => {
    if (pendingSearch && pendingSearch.shouldSearch) {
      // Сбрасываем флаг перед выполнением поиска
      setPendingSearch(null);
      
      // Выполняем поиск с небольшой задержкой для гарантии обновления состояния
      setTimeout(() => {
        console.log('Выполняем отложенный поиск после установки запроса');
        executeSearch();
      }, 50);
    }
  }, [pendingSearch, executeSearch]);

  // Обработчик выбора продукта из AI-помощника
  const handleSelectProduct = (product: string, performSearch: boolean = false) => {
    if (!product || typeof product !== 'string') {
      console.error('Некорректное значение товара:', product);
      toast.error('Не удалось выбрать товар: некорректные данные');
      return;
    }
    
    try {
      console.log(`Товар "${product}" добавлен в поле поиска, performSearch: ${performSearch}`);
      
      // Устанавливаем поисковый запрос
      setSearchQuery(product);
      
      // Если требуется выполнить поиск, устанавливаем состояние для отложенного поиска
      if (performSearch) {
        toast.info(`Начинаем поиск товара: ${product}`, {
          duration: 2000
        });
        
        // Устанавливаем флаг для запуска поиска после обновления состояния
        setPendingSearch({ query: product, shouldSearch: true });
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
