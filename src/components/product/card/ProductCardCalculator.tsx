
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Product } from "@/services/types";
import { MiniCostCalculator } from '../MiniCostCalculator';

interface ProductCardCalculatorProps {
  product: Product;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardCalculator: React.FC<ProductCardCalculatorProps> = ({ 
  product,
  onStopPropagation
}) => {
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  
  // Function to toggle calculator display
  const toggleCalculator = (e: React.MouseEvent) => {
    onStopPropagation(e);
    setShowCalculator(prev => !prev);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs mt-1 w-full py-1 h-auto"
        onClick={toggleCalculator}
      >
        {showCalculator ? "Скрыть расчет" : "Расчет стоимости"}
      </Button>
      
      {showCalculator && (
        <MiniCostCalculator product={product} />
      )}
    </>
  );
};
