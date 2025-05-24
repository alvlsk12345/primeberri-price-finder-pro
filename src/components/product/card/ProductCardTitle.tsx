
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { ProductCardDescription } from './ProductCardDescription';

interface ProductCardTitleProps {
  title: string;
  description?: string;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardTitle: React.FC<ProductCardTitleProps> = ({
  title,
  description,
  onStopPropagation
}) => {
  // Проверяем, демонстрационный ли это товар
  const isDemoProduct = title.includes('[ДЕМО]');
  
  return (
    <div className="flex items-start justify-between gap-1 mb-2">
      <h3 className="font-semibold text-sm leading-tight line-clamp-3 flex-grow">
        {isDemoProduct ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild onClick={onStopPropagation}>
                <span className="flex items-start gap-1">
                  <span className="line-clamp-3">{title.replace('[ДЕМО] ', '')}</span>
                  <Info size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Это демонстрационный товар, созданный системой</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : title}
      </h3>
      
      {description && (
        <div className="flex-shrink-0">
          <ProductCardDescription 
            description={description} 
            onStopPropagation={onStopPropagation} 
          />
        </div>
      )}
    </div>
  );
};
