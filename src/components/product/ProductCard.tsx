
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/services/types";
import { ProductImage } from './ProductImage';
import { ProductCardTitle } from './card/ProductCardTitle';
import { ProductCardRating } from './card/ProductCardRating';
import { ProductCardPrice } from './card/ProductCardPrice';
import { ProductCardDescription } from './card/ProductCardDescription';
import { ProductCardCalculator } from './card/ProductCardCalculator';
import { ProductCardActions } from './card/ProductCardActions';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected, onSelect }) => {
  // Helper function to prevent event propagation
  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(product)}
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex flex-col items-center w-full h-full">
          {/* Удалим блок с черной плашкой, который перекрывал фото */}
          
          <ProductImage 
            image={product.image} 
            title={product.title} 
            productId={product.id} 
          />
          
          <div className="w-full text-center flex flex-col flex-grow mt-3 min-h-[12rem]">
            <ProductCardTitle 
              title={product.title}
              onStopPropagation={handleStopPropagation}
            />
            
            <ProductCardRating 
              source={product.source}
              rating={product.rating}
            />
            
            <ProductCardPrice 
              price={product.price}
              availability={product.availability}
              currency={product.currency}
            />
            
            <ProductCardDescription 
              description={product.description}
              onStopPropagation={handleStopPropagation}
            />
            
            <ProductCardCalculator 
              product={product}
              onStopPropagation={handleStopPropagation}
            />
          </div>
          
          <div className="w-full mt-auto border-t pt-3">
            <ProductCardActions 
              product={product}
              isSelected={isSelected}
              onSelect={onSelect}
              onStopPropagation={handleStopPropagation}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
