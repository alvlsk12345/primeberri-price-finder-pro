
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageOff } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
};

type SearchResultsProps = {
  results: Product[];
  onSelect: (product: Product) => void;
  selectedProduct: Product | null;
};

export const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelect, selectedProduct }) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = "https://via.placeholder.com/150?text=Нет+изображения";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((product) => (
        <Card 
          key={product.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedProduct?.id === product.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelect(product)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <div className="w-full h-[150px] mb-3 flex items-center justify-center relative">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ImageOff size={40} />
                    <span className="mt-2 text-sm">Нет изображения</span>
                  </div>
                )}
              </div>
              
              <div className="w-full text-center">
                <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                <div className="text-sm mb-2">{product.store}</div>
                <div className="font-bold text-lg">
                  {product.price} {product.currency}
                </div>
              </div>
              
              {selectedProduct?.id !== product.id && (
                <Button 
                  variant="outline" 
                  className="mt-3 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(product);
                  }}
                >
                  Выбрать
                </Button>
              )}
              
              {selectedProduct?.id === product.id && (
                <Button 
                  variant="default"
                  className="mt-3 w-full"
                  disabled
                >
                  Выбрано
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
