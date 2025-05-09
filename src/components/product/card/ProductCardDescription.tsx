
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { FileText } from "lucide-react";

interface ProductCardDescriptionProps {
  description?: string;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardDescription: React.FC<ProductCardDescriptionProps> = ({
  description,
  onStopPropagation
}) => {
  if (!description) {
    return <div className="h-6"></div>; // Empty placeholder with fixed height
  }

  return (
    <div className="flex justify-center mt-1 mb-2">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button
            onClick={onStopPropagation}
            className="flex items-center text-xs text-gray-600 hover:text-primary transition-colors"
          >
            <FileText size={14} className="mr-1" />
            <span>Описание</span>
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-72 p-3 text-sm">
          <div className="font-semibold mb-1">Описание товара</div>
          <p className="text-xs">{description}</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
