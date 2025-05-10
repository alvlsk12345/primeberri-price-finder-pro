
import React from "react";
import { BrandSuggestionItem } from "./BrandSuggestionItem";
import { BrandSuggestion } from "@/services/types";

interface BrandSuggestionListProps {
  suggestions: BrandSuggestion[];
  onSelect: (brand: string) => void;
}

export const BrandSuggestionList: React.FC<BrandSuggestionListProps> = ({ 
  suggestions, 
  onSelect 
}) => {
  return (
    <div className="mt-4 p-3 bg-slate-50 rounded-md border">
      <h3 className="text-sm font-medium mb-2">Рекомендуемые бренды:</h3>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <BrandSuggestionItem 
            key={index} 
            suggestion={suggestion} 
            onSelect={() => onSelect(suggestion.brand)} 
          />
        ))}
      </div>
    </div>
  );
};
