
import React from "react";
import { BrandSuggestion } from "@/services/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface BrandSuggestionItemProps {
  suggestion: BrandSuggestion;
  onSelect: (immediate?: boolean) => void;
  index: number;
}

export const BrandSuggestionItem: React.FC<BrandSuggestionItemProps> = ({ 
  suggestion, 
  onSelect, 
  index 
}) => {
  const brand = suggestion.brand || suggestion.name || '';
  const product = suggestion.product || 
    (Array.isArray(suggestion.products) && suggestion.products.length > 0 
      ? suggestion.products[0] 
      : '');
  const description = suggestion.description || '';

  // Добавляем небольшую задержку для анимации появления элементов
  const animationDelay = `${index * 50}ms`;

  return (
    <div 
      className={cn(
        "p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-all",
        "transform opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}
      style={{ animationDelay }}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="text-sm">
            <span className="font-bold text-gray-900">{brand}</span>
            {product && <span className="ml-1 text-gray-700">— {product}</span>}
          </h4>
        </div>
        
        {description && (
          <p className="text-xs text-gray-600">{description}</p>
        )}
        
        <div className="flex justify-end pt-1">
          <Button 
            onClick={() => onSelect(true)} 
            variant="brand" 
            size="sm" 
            className="h-8"
          >
            <Search size={16} className="mr-1" />
            Найти товар
          </Button>
        </div>
      </div>
    </div>
  );
};
