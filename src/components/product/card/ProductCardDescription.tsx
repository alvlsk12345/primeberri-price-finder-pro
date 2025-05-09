
import React from 'react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
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

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
          onClick={(e) => {
            onStopPropagation(e);
            setIsPopoverOpen(true);
          }}
        >
          <FileText size={14} />
          <span className="sr-only">Показать описание</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 text-sm" side="top">
        <div className="font-semibold mb-1">Описание товара</div>
        <p className="text-xs">{description}</p>
      </PopoverContent>
    </Popover>
  );
};
