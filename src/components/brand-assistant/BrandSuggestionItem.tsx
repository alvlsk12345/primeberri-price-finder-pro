
import React from "react";
import { Button } from "@/components/ui/button";
import { BrandSuggestion } from "@/services/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageOff } from "lucide-react";

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
        <div className="flex gap-3">
          {suggestion.imageUrl ? (
            <Avatar className="h-14 w-14 rounded">
              <AvatarImage 
                src={suggestion.imageUrl} 
                alt={suggestion.product}
                className="object-cover" 
              />
              <AvatarFallback className="bg-slate-100">
                <ImageOff size={16} className="text-slate-400" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-14 w-14 bg-slate-100 rounded flex items-center justify-center">
              <ImageOff size={20} className="text-slate-400" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium">{suggestion.brand}</p>
            <p className="text-sm">{suggestion.product}</p>
            <p className="text-xs text-gray-600">{suggestion.description}</p>
          </div>
        </div>
        <Button 
          variant="brand" 
          size="sm" 
          className="self-start sm:self-center whitespace-nowrap"
          onClick={onSelect}
        >
          Искать этот товар
        </Button>
      </div>
    </div>
  );
};
