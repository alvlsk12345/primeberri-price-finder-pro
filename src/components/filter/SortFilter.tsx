
import React from 'react';
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowDown, ArrowUp, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SortOption } from "@/services/types";

interface SortFilterProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export const SortFilter: React.FC<SortFilterProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Сортировать по:</Label>
      </div>
      
      <TooltipProvider>
        <ToggleGroup 
          type="single" 
          value={sortBy}
          onValueChange={(value) => onSortChange(value as SortOption)}
          className="justify-start"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="price_asc" aria-label="По возрастанию цены">
                <ArrowUp className="h-4 w-4" />
                <span>Цена</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>По возрастанию цены</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="price_desc" aria-label="По убыванию цены">
                <ArrowDown className="h-4 w-4" />
                <span>Цена</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>По убыванию цены</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="rating_desc" aria-label="По популярности">
                <Star className="h-4 w-4" />
                <span>Рейтинг</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>По популярности (рейтингу)</p>
            </TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </TooltipProvider>
    </div>
  );
};
