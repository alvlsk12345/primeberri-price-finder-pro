
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
    
    // Если требуется выполнить поиск сразу после выбора продукта
    if (performSearch) {
      setTimeout(() => {
        executeSearch();
      }, 500); // Небольшая задержка для лучшего UX
    }
  };

  return { handleSelectProduct };
};
