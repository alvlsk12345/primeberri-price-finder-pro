import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
interface ProductCardDescriptionProps {
  description?: string;
  onStopPropagation: (e: React.MouseEvent) => void;
}
export const ProductCardDescription: React.FC<ProductCardDescriptionProps> = ({
  description,
  onStopPropagation
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  if (!description) {
    return null;
  }
  return <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 text-sm">
        <div className="font-semibold mb-1">Описание товара</div>
        <p className="text-xs">{description}</p>
      </PopoverContent>
    </Popover>;
};