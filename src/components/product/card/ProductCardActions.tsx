
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
  // Check product link on component mount
  useEffect(() => {
    const originalLink = product.link || '';
    const processedLink = getProductLink(product);
    
    // Check if original link is a search engine link
    if (originalLink && isSearchEngineLink(originalLink)) {
      console.log(`Search engine link replaced for: ${product.title}`);
      console.log(`  - Original: ${originalLink.substring(0, 100)}...`);
      console.log(`  - Replaced with: ${processedLink}`);
    }
  }, [product]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    onStopPropagation(e);
    
    // Always use generated direct link to product in store
    const directLink = getProductLink(product);
    
    navigator.clipboard.writeText(directLink);
    toast.success('Product link copied!');
    
    console.log('Copied direct link:', directLink);
  };
  
  const handleGoToPrimeberri = (e: React.MouseEvent) => {
    e.preventDefault();
    onStopPropagation(e);
    
    // In real implementation, this would be logic to go to Primeberri site
    window.open('https://primeberri.com/', '_blank');
    toast.success('Going to Primeberri site');
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
          <Copy size={16} className="mr-1" /> Copy Link
        </Button>
      </div>
      
      <Button 
        variant="default" 
        size="sm" 
        className="flex-1 h-8 text-xs px-2 mt-2"
        onClick={handleGoToPrimeberri}
      >
        <ExternalLink size={16} className="mr-1" /> Order on Primeberri
      </Button>
    </div>
  );
};
