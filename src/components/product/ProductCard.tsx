import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/services/types";
import { ProductImage } from './ProductImage';
import { ProductCardTitle } from './card/ProductCardTitle';
import { ProductCardRating } from './card/ProductCardRating';
import { ProductCardPrice } from './card/ProductCardPrice';
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
      className={`cursor-pointer transition-all hover:shadow-md h-full flex flex-col min-w-0 ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(product)}
    >
      <CardContent className="p-3 flex flex-col h-full min-w-0">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0">
            <ProductImage 
              image={product.image} 
              title={product.title} 
              productId={product.id} 
            />
          </div>
          
          <div className="flex flex-col flex-grow min-w-0">
            <ProductCardTitle 
              title={product.title}
              description={product.description}
              onStopPropagation={handleStopPropagation}
            />
            
            <ProductCardRating 
              source={product.source}
              rating={product.rating}
              country={product.country}
            />
            
            <div className="flex-grow min-w-0">
              <ProductCardPrice 
                price={product.price}
                availability={product.availability}
                currency={product.currency}
              />
            </div>
            
            <ProductCardCalculator 
              product={product}
              onStopPropagation={handleStopPropagation}
            />
          </div>
          
          <div className="flex-shrink-0 mt-3 pt-3 border-t">
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
