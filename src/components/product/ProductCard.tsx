
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Info } from "lucide-react";
import { Product } from "@/services/types";
import { ProductImage } from './ProductImage';
import { ProductDetailsDialog } from './ProductDetailsDialog';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected, onSelect }) => {
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
            <h3 className="font-semibold text-base mb-1 line-clamp-2">{product.title}</h3>
            <div className="text-sm mb-2 flex items-center justify-center">
              <span className="mr-1 text-xs">{product.source}</span>
              <div className="flex items-center">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs ml-1">{product.rating}</span>
              </div>
            </div>
            <div className="font-bold text-lg">
              {product.price}
            </div>
            <div className="text-xs text-gray-500">
              {product.availability}
            </div>
          </div>
          
          <div className="flex w-full mt-3 gap-2">
            {!isSelected ? (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(product);
                }}
              >
                Выбрать
              </Button>
            ) : (
              <Button 
                variant="default"
                className="flex-1"
                disabled
              >
                Выбрано
              </Button>
            )}
            
            <ProductDetailsDialog product={product} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
