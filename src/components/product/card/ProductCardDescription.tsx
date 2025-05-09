
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
          variant="ghost" 
          size="sm" 
          className="text-xs mt-2 w-full py-1 h-auto flex items-center justify-center gap-1"
          onClick={(e) => {
            onStopPropagation(e);
            setIsPopoverOpen(true);
          }}
        >
          <FileText size={14} />
          <span>Показать описание</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 text-sm">
        <div className="font-semibold mb-1">Описание товара</div>
        <p className="text-xs">{description}</p>
      </PopoverContent>
    </Popover>
  );
};
