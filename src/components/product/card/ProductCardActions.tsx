
import React from 'react';
import { Product } from "@/services/types";
import { ProductDetailsDialog } from '../ProductDetailsDialog';

interface ProductCardActionsProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardActions: React.FC<ProductCardActionsProps> = ({
  product,
  onStopPropagation
}) => {
  return (
    <div className="flex w-full mt-3 justify-center">
      <ProductDetailsDialog product={product} />
    </div>
  );
};
