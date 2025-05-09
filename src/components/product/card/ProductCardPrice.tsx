
import React from 'react';

interface ProductCardPriceProps {
  price: string;
  availability?: string;
}

export const ProductCardPrice: React.FC<ProductCardPriceProps> = ({ 
  price,
  availability
}) => {
  return (
    <>
      <div className="font-bold text-lg">
        {price}
      </div>
      {availability && (
        <div className="text-xs text-gray-500">
          {availability}
        </div>
      )}
    </>
  );
};
