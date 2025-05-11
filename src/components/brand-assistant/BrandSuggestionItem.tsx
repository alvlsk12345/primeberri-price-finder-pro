
import React from "react";
import { BrandSuggestion } from "@/services/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        "p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-all",
        "transform opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}
      style={{ animationDelay }}
    >
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-semibold text-gray-900">
            {brand} {product && <span className="font-normal">— {product}</span>}
          </h4>
          <div className="flex space-x-1">
            <Button 
              onClick={() => onSelect()} 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
            >
              Добавить
            </Button>
            <Button 
              onClick={() => onSelect(true)} 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 text-xs"
            >
              Искать
            </Button>
          </div>
        </div>
        {description && (
          <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
};
