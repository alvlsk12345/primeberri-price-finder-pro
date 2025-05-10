
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

interface ProductCardDescriptionProps {
  description?: string;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardDescription: React.FC<ProductCardDescriptionProps> = ({
  description,
  onStopPropagation
}) => {
  if (!description) {
    return null;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          onClick={onStopPropagation}
          className="flex items-center justify-center rounded-full w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <Info size={12} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-3 text-sm">
        <div className="font-semibold mb-1">Описание товара</div>
        <p className="text-xs">{description}</p>
      </HoverCardContent>
    </HoverCard>
  );
};
