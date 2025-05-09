
import React from 'react';
import { ProductDetailsDialog } from '../ProductDetailsDialog';
import { Product } from "@/services/types";

interface ProductCardTitleProps {
  title: string;
  product: Product;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardTitle: React.FC<ProductCardTitleProps> = ({ 
  title,
  product,
  onStopPropagation
}) => {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <h3 className="font-semibold text-base line-clamp-2 text-left">{title}</h3>
      <ProductDetailsDialog product={product} buttonText="Подробнее о товаре" />
    </div>
  );
};
