
import React from 'react';
import { Product } from "@/services/types";
import { ProductDetailsDialog } from '../ProductDetailsDialog';
import { getProductLink } from "@/services/urlService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductCardActionsProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardActions: React.FC<ProductCardActionsProps> = ({
  product,
  onStopPropagation
}) => {
  const handlePrimeberriOrder = (e: React.MouseEvent) => {
    // Stop event propagation to prevent card selection
    onStopPropagation(e);
    
    // Get product link
    const productLink = getProductLink(product);
    
    // Copy link to clipboard
    navigator.clipboard.writeText(productLink);
    
    // Show detailed toast notification with instructions
    toast.success(
      <div className="flex flex-col gap-1">
        <p>Ссылка скопирована в буфер обмена</p>
        <p className="text-xs">Вставьте ссылку в поле ввода на Primeberri</p>
      </div>,
      { duration: 5000 }
    );
    
    // Open Primeberri in a new tab
    window.open('https://primeberri.com/', '_blank');
  };
  
  return (
    <div className="flex flex-col gap-2">
      <ProductDetailsDialog product={product} />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={handlePrimeberriOrder}
              variant="brand-outline"
              className="flex items-center gap-2 w-full justify-center"
            >
              <img 
                src="/lovable-uploads/f3068d76-e0d6-47bb-9c0b-63b57087fd80.png" 
                alt="Primeberri" 
                className="h-5 w-5" 
              />
              Заказать на Primeberri
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Перейдите на сайт Primeberri со ссылкой на товар</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
