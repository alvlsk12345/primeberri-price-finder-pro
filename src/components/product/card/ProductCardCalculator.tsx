
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
  // Мы просто возвращаем пустой фрагмент, чтобы не отображать калькулятор
  return <></>;
};
