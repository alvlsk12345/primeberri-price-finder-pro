import React from 'react';
import { Button } from "@/components/ui/button";
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
  isSelected,
  onSelect,
  onStopPropagation
}) => {
  return <div className="flex w-full mt-3 gap-2">
      {!isSelected ? <Button variant="outline" className="flex-1" onClick={e => {
      onStopPropagation(e);
      onSelect(product);
    }}>
          Выбрать
        </Button> : <Button variant="default" className="flex-1" disabled>
          Выбрано
        </Button>}
      
      <ProductDetailsDialog product={product} />
    </div>;
};