
import React from 'react';
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/services/types";

interface ProductDetailsInfoProps {
  product: Product;
}

export const ProductDetailsInfo: React.FC<ProductDetailsInfoProps> = ({ product }) => {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Цена: {product.price || "Цена не указана"}</h3>
        <p className="text-sm">{product.availability || "Наличие не указано"}</p>
        <div className="flex items-center mt-1">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="ml-1">{product.rating || 0}/5</span>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold mb-1">Магазин</h4>
        <p>{product.source || "Не указан"}</p>
      </div>
      
      {product.brand && (
        <div className="mb-4">
          <h4 className="font-semibold mb-1">Бренд</h4>
          <p>{product.brand}</p>
        </div>
      )}
      
      <Button
        onClick={() => window.open(product.link, '_blank')}
        className="w-full mt-2"
      >
        Перейти в магазин
      </Button>
    </div>
  );
};
