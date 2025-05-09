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
  return <>
      
      
      {showCalculator && <MiniCostCalculator product={product} />}
    </>;
};