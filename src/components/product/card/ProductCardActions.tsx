import React from 'react';
import { Button } from "@/components/ui/button";
import { Product } from "@/services/types";
import { ProductDetailsDialog } from '../ProductDetailsDialog';
import { Info } from 'lucide-react';
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
  // Определяем, является ли товар демонстрационным
  const isDemoProduct = product.title.includes('[ДЕМО]');
  return <div className="flex w-full mt-3 gap-2">
      {!isSelected ? <Button variant="outline" className="flex-1" onClick={e => {
      onStopPropagation(e);
      onSelect(product);
    }}>
          {isDemoProduct && <Info size={14} className="mr-1 text-amber-500" />}
          Выбрать
        </Button> : <Button variant="default" className="flex-1" disabled>
          {isDemoProduct && <Info size={14} className="mr-1 text-white" />}
          Выбрано
        </Button>}
      
      <ProductDetailsDialog product={product} />
    </div>;
};