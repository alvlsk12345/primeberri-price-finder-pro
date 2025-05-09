
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Product } from "@/services/types";
import { toast } from "@/components/ui/sonner";
import { Copy, ExternalLink } from "lucide-react";
import { getProductLink, isSearchEngineLink } from "@/services/urlService";

interface ProductCardActionsProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardActions: React.FC<ProductCardActionsProps> = ({ 
  product,
  isSelected,
  onSelect,
  onStopPropagation
}) => {
  // Проверяем ссылку на товар при монтировании компонента
  useEffect(() => {
    const originalLink = product.link || '';
    const processedLink = getProductLink(product);
    
    // Проверяем, является ли оригинальная ссылка поисковой
    if (originalLink && isSearchEngineLink(originalLink)) {
      console.log(`Поисковая ссылка заменена для: ${product.title}`);
      console.log(`  - Оригинал: ${originalLink.substring(0, 100)}...`);
      console.log(`  - Замена на: ${processedLink}`);
    }
  }, [product]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    onStopPropagation(e);
    
    // Приоритетно используем оригинальную ссылку, если она не поисковая
    let linkToCopy = product.link;
    
    // Проверяем, является ли ссылка поисковой или отсутствует
    if (!linkToCopy || isSearchEngineLink(linkToCopy)) {
      // Если ссылка поисковая или отсутствует, генерируем новую
      linkToCopy = getProductLink(product);
    }
    
    navigator.clipboard.writeText(linkToCopy);
    toast.success('Ссылка на товар скопирована!');
    
    console.log('Скопирована ссылка:', linkToCopy);
  };
  
  const handleGoToPrimeberri = (e: React.MouseEvent) => {
    e.preventDefault();
    onStopPropagation(e);
    
    // В реальной реализации здесь будет логика перехода на сайт Primeberri
    window.open('https://primeberri.com/', '_blank');
    toast.success('Переход на сайт Primeberri');
  };
  
  return (
    <div className="flex w-full mt-3 gap-2 flex-col">
      <div className="flex gap-2 w-full">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-8"
          onClick={handleCopyLink}
        >
          <Copy size={16} className="mr-1" /> Скопировать ссылку
        </Button>
      </div>
      
      <Button 
        variant="default" 
        size="sm" 
        className="flex-1 h-8 text-xs px-2 mt-2"
        onClick={handleGoToPrimeberri}
      >
        <ExternalLink size={16} className="mr-1" /> Заказать на Primeberri
      </Button>
    </div>
  );
};
