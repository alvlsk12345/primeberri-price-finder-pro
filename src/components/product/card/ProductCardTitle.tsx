
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ProductCardTitleProps {
  title: string;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardTitle: React.FC<ProductCardTitleProps> = ({ 
  title,
  onStopPropagation
}) => {
  // Проверяем, демонстрационный ли это товар
  const isDemoProduct = title.includes('[ДЕМО]');

  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-base line-clamp-2 flex-1 text-left">
        {isDemoProduct ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild onClick={onStopPropagation}>
                <span className="flex items-center">
                  <span>{title.replace('[ДЕМО] ', '')}</span>
                  <Info size={14} className="ml-1 text-amber-500" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Это демонстрационный товар, созданный системой</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : title}
      </h3>
    </div>
  );
};

