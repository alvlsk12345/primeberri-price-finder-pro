
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
    <div className="flex items-center justify-center mb-2 relative">
      <h3 className="font-semibold text-base line-clamp-2 text-center h-12">
        {isDemoProduct ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild onClick={onStopPropagation}>
                <span className="flex items-center gap-1 justify-center">
                  <span>{title.replace('[ДЕМО] ', '')}</span>
                  <Info size={14} className="text-amber-500 flex-shrink-0" />
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
        <div className="absolute top-0 right-0">
          <ProductCardDescription 
            description={description} 
            onStopPropagation={onStopPropagation} 
          />
        </div>
      )}
    </div>
  );
};
