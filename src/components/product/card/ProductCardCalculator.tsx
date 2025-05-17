
import React from 'react';
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
  // Возвращаем пустой компонент, чтобы не отображать калькулятор в карточке
  return null;
};
