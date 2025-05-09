
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
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(product)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <div className="relative w-full">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl-md z-10">
              {product.subtitle}
            </div>
          </div>
          
          <ProductImage 
            image={product.image} 
            title={product.title} 
            productId={product.id} 
          />
          
          <div className="w-full text-center">
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
          
          <ProductCardActions 
            product={product}
            isSelected={isSelected}
            onSelect={onSelect}
            onStopPropagation={handleStopPropagation}
          />
        </div>
      </CardContent>
    </Card>
  );
};
