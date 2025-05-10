
import React from "react";
import { Button } from "@/components/ui/button";
import { BrandSuggestion } from "@/services/types";

interface BrandSuggestionItemProps {
  suggestion: BrandSuggestion;
  onSelect: () => void;
}

export const BrandSuggestionItem: React.FC<BrandSuggestionItemProps> = ({ 
  suggestion, 
  onSelect 
}) => {
  return (
    <div className="p-2 bg-white rounded border hover:bg-slate-50 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium">{suggestion.brand}</p>
          <p className="text-sm">{suggestion.product}</p>
          <p className="text-xs text-gray-600">{suggestion.description}</p>
        </div>
        <Button 
          variant="brand" 
          size="sm" 
          className="self-start sm:self-center whitespace-nowrap"
          onClick={onSelect}
        >
          Вставить в поиск
        </Button>
      </div>
    </div>
  );
};
