
import React from 'react';

interface ProductCardTitleProps {
  title: string;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardTitle: React.FC<ProductCardTitleProps> = ({ 
  title,
  onStopPropagation
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-base line-clamp-2 flex-1 text-left">{title}</h3>
    </div>
  );
};
