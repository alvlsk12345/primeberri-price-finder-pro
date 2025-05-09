
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { PopoverTrigger } from "@/components/ui/popover";

interface FilterTriggerProps {
  activeFiltersCount: number;
}

export const FilterTrigger: React.FC<FilterTriggerProps> = ({
  activeFiltersCount
}) => {
  return (
    <PopoverTrigger asChild>
      <Button variant="outline" className="flex items-center justify-center w-10 p-0 h-10">
        <Filter size={16} />
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">{activeFiltersCount}</Badge>
        )}
      </Button>
    </PopoverTrigger>
  );
};
