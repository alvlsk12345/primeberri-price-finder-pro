
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
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:translate-y-[-4px]'
      }`}
      onClick={() => onSelect(product)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <div className="relative w-full mb-4">
            {product.subtitle && (
              <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl-md z-10">
                {product.subtitle}
              </div>
            )}
            
            <div className="relative group">
              <ProductImage 
                image={product.image} 
                title={product.title} 
                productId={product.id} 
              />
              
              {product.description && (
                <div className="absolute top-2 right-2">
                  <ProductCardDescription 
                    description={product.description}
                    onStopPropagation={handleStopPropagation}
                  />
                </div>
              )}
            </div>
          </div>
          
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
