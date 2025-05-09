
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
    return <div className="h-6"></div>; // Empty placeholder with fixed height
  }
  return <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full h-8 p-0 hover:bg-gray-100 text-gray-600"
          onClick={onStopPropagation}
        >
          <FileText size={14} className="mr-1" />
          <span className="text-xs">Описание</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 text-sm">
        <div className="font-semibold mb-1">Описание товара</div>
        <p className="text-xs">{description}</p>
      </PopoverContent>
    </Popover>;
};
