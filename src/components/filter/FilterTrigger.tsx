
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
      <Button variant="outline" className="flex items-center gap-2">
        <Filter size={16} />
        <span>Фильтры</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
        )}
      </Button>
    </PopoverTrigger>
  );
};
