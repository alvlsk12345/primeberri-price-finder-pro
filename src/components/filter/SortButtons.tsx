
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Star } from "lucide-react";
import { SortOption } from "@/services/types";
import { cn } from "@/lib/utils";

interface SortButtonsProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export const SortButtons: React.FC<SortButtonsProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex gap-2 items-center">
      <Button
        size="sm"
        variant={sortBy === "price_asc" ? "brand" : "outline"}
        onClick={() => onSortChange("price_asc")}
        className="flex items-center gap-1 px-2 py-1 h-auto"
        aria-label="По возрастанию цены"
      >
        <ArrowUp className="h-4 w-4" />
        <span className="text-xs">Цена</span>
      </Button>
      
      <Button
        size="sm"
        variant={sortBy === "price_desc" ? "brand" : "outline"}
        onClick={() => onSortChange("price_desc")}
        className="flex items-center gap-1 px-2 py-1 h-auto"
        aria-label="По убыванию цены"
      >
        <ArrowDown className="h-4 w-4" />
        <span className="text-xs">Цена</span>
      </Button>
      
      <Button
        size="sm"
        variant={sortBy === "rating_desc" ? "brand" : "outline"}
        onClick={() => onSortChange("rating_desc")}
        className="flex items-center gap-1 px-2 py-1 h-auto"
        aria-label="По рейтингу"
      >
        <Star className="h-4 w-4" />
        <span className="text-xs">Рейтинг</span>
      </Button>
    </div>
  );
};
