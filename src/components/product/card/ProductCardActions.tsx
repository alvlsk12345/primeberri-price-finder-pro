
import React from 'react';
import { Button } from "@/components/ui/button";
import { Product } from "@/services/types";
import { ProductDetailsDialog } from '../ProductDetailsDialog';
import { toast } from "@/components/ui/sonner";
import { Copy, ExternalLink } from "lucide-react";
import { getProductLink } from "@/services/urlService";

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
  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    onStopPropagation(e);
    
    const productLink = getProductLink(product);
    navigator.clipboard.writeText(productLink);
    toast.success('Ссылка на товар скопирована!');
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
        <ProductDetailsDialog product={product} />
      </div>
      
      <div className="flex gap-2 w-full">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-8"
          onClick={handleCopyLink}
        >
          <Copy size={16} className="mr-1" /> Скопировать ссылку
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 h-8 text-xs px-2"
          onClick={handleGoToPrimeberri}
        >
          <ExternalLink size={16} className="mr-1" /> Заказать на Primeberri
        </Button>
      </div>
    </div>
  );
};
