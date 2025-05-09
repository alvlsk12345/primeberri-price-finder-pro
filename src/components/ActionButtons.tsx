
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Link } from 'lucide-react';
import { toast } from "@/components/ui/sonner";
import { getProductLink, isSearchEngineLink } from "@/services/urlService";
import { Product } from "@/services/types";

type ActionButtonsProps = {
  selectedProduct: Product | null;
  searchQuery: string;
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  selectedProduct,
  searchQuery 
}) => {
  const handleGoToPrimeberri = () => {
    if (selectedProduct) {
      // В реальной реализации здесь будет логика перехода на сайт Primeberri
      window.open('https://primeberri.com/', '_blank');
      toast.success('Переход на сайт Primeberri');
    } else {
      toast.error('Пожалуйста, выберите товар');
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    // Предотвращаем стандартное поведение для предотвращения перезагрузки страницы
    e.preventDefault();
    
    if (selectedProduct) {
      // Приоритетно используем оригинальную ссылку, если она не поисковая
      let linkToCopy = selectedProduct.link;
      
      // Проверяем, является ли ссылка поисковой или отсутствует
      if (!linkToCopy || isSearchEngineLink(linkToCopy)) {
        // Если ссылка поисковая или отсутствует, генерируем новую
        linkToCopy = getProductLink(selectedProduct);
      }
      
      navigator.clipboard.writeText(linkToCopy);
      toast.success('Ссылка на товар скопирована!');
      console.log('Скопирована ссылка:', linkToCopy);
    } else {
      toast.error('Пожалуйста, выберите товар');
    }
  };
  
  // Функция для прямого перехода на страницу товара
  const handleVisitProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (selectedProduct) {
      // Приоритетно используем оригинальную ссылку, если она не поисковая
      let productLink = selectedProduct.link;
      
      // Проверяем, является ли ссылка поисковой или отсутствует
      if (!productLink || isSearchEngineLink(productLink)) {
        // Если ссылка поисковая или отсутствует, генерируем новую
        productLink = getProductLink(selectedProduct);
      }
      
      window.open(productLink, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Пожалуйста, выберите товар');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      <Button 
        onClick={handleCopyLink} 
        variant="outline" 
        className="flex-1"
      >
        <span className="flex items-center gap-2">
          <Link size={18} /> Копировать ссылку
        </span>
      </Button>
      <Button 
        onClick={handleVisitProduct}
        variant="outline"
        className="flex-1"
      >
        <span className="flex items-center gap-2">
          Перейти к товару <ArrowRight size={18} />
        </span>
      </Button>
      <Button 
        onClick={handleGoToPrimeberri} 
        className="flex-1"
      >
        <span className="flex items-center gap-2">
          Перейти на Primeberri <ArrowRight size={18} />
        </span>
      </Button>
    </div>
  );
};
