
import React from 'react';
import { Product } from "@/services/types";
import { ProductDetailsDialog } from '../ProductDetailsDialog';
import { getProductLink } from "@/services/urlService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
    
    // Copy link to clipboard
    const productLink = getProductLink(product);
    navigator.clipboard.writeText(productLink);
    
    // Show toast notification
    toast.success('Ссылка скопирована');
    
    // Find the input element and insert the link
    const linkInput = document.getElementById('link') as HTMLInputElement;
    if (linkInput) {
      linkInput.value = productLink;
      // Trigger input event to notify any listeners that the value has changed
      const inputEvent = new Event('input', { bubbles: true });
      linkInput.dispatchEvent(inputEvent);
    }
    
    // Navigate to Primeberri
    window.open('https://primeberri.com/', '_blank');
  };
  
  return (
    <div className="flex flex-col w-full mt-3 items-center gap-2">
      <ProductDetailsDialog product={product} />
      <Button 
        onClick={handlePrimeberriOrder}
        variant="outline"
        className="flex items-center gap-2 w-full justify-center"
      >
        <img 
          src="/lovable-uploads/f3068d76-e0d6-47bb-9c0b-63b57087fd80.png" 
          alt="Primeberri" 
          className="h-5 w-5" 
        />
        Заказать на Primeberri
      </Button>
    </div>
  );
};
