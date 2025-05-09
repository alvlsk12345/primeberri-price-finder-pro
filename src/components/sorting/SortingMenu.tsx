
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SortAsc, SortDesc } from "lucide-react";

export type SortOption = 'price-asc' | 'price-desc' | 'popularity-desc' | 'default';

interface SortingMenuProps {
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
}

export const SortingMenu: React.FC<SortingMenuProps> = ({
  currentSort,
  onSortChange
}) => {
  // Function to render the correct icon based on current sort
  const getSortIcon = () => {
    if (currentSort === 'price-asc') return <SortAsc size={16} />;
    if (currentSort === 'price-desc') return <SortDesc size={16} />;
    return <SortAsc size={16} />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10">
          {getSortIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => onSortChange('default')}
          className={currentSort === 'default' ? "bg-accent" : ""}
        >
          По умолчанию
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange('price-asc')}
          className={currentSort === 'price-asc' ? "bg-accent" : ""}
        >
          Цена: по возрастанию
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange('price-desc')}
          className={currentSort === 'price-desc' ? "bg-accent" : ""}
        >
          Цена: по убыванию
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange('popularity-desc')}
          className={currentSort === 'popularity-desc' ? "bg-accent" : ""}
        >
          По популярности
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
