
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
    
    // Store link in localStorage so it can be accessed from Primeberri
    localStorage.setItem('primeberriProductLink', productLink);
    
    // Open Primeberri in a new tab
    const primeberriWindow = window.open('https://primeberri.com/', '_blank');
    
    // Try to inject the link into the input field using a slight delay
    if (primeberriWindow) {
      // Create a script to run on the Primeberri site that will find the input field
      const scriptToInject = `
        // Wait for the page to fully load
        window.addEventListener('load', function() {
          // Function to insert the link
          function insertProductLink() {
            // Get the link from localStorage
            const productLink = localStorage.getItem('primeberriProductLink');
            if (!productLink) return;
            
            // Try to find the input field
            const linkInput = document.getElementById('link') || 
              document.querySelector('input[placeholder="Введите ссылку на товар"]') ||
              document.querySelector('.section-content input[type="url"]');
              
            if (linkInput) {
              // Set the value and trigger input event
              linkInput.value = productLink;
              linkInput.dispatchEvent(new Event('input', { bubbles: true }));
              console.log('Product link inserted successfully');
            } else {
              // If not found immediately, try again after a delay
              setTimeout(insertProductLink, 1000);
            }
          }
          
          // Start the process
          insertProductLink();
        });
      `;
      
      // We can't directly inject the script due to browser security restrictions,
      // but we can provide instructions to the user
      console.log('Script prepared for Primeberri integration');
    }
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
