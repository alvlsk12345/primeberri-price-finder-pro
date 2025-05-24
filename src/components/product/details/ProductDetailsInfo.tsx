
import React from 'react';
import { Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/services/types";
import { getProductLink } from "@/services/urlService";
import { toast } from "sonner";

interface ProductDetailsInfoProps {
  product: Product;
}

export const ProductDetailsInfo: React.FC<ProductDetailsInfoProps> = ({ product }) => {
  const handleOpenStore = () => {
    const productLink = getProductLink(product);
    
    // Добавляем логирование для отладки
    console.log(`Открываю ссылку магазина в новой вкладке: ${productLink}`);
    console.log(`Источник товара: ${product.source}`);
    
    window.open(productLink, '_blank');
    
    // Показываем уведомление с указанием магазина
    toast.success(`Переход в магазин ${product.source || 'товара'}`);
  };
  
  return (
    <div>
      <div className="mb-4">
        {product.price && product.price !== "Цена не указана" && (
          <h3 className="text-lg font-bold">Цена: {product.price}</h3>
        )}
        {product.availability && product.availability !== "Наличие не указано" && product.availability !== "Нет данных" && (
          <p className="text-sm">{product.availability}</p>
        )}
        {product.rating && product.rating > 0 && (
          <div className="flex items-center mt-1">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="ml-1">{product.rating}/5</span>
          </div>
        )}
      </div>
      
      {product.source && product.source !== "Не указан" && (
        <div className="mb-4">
          <h4 className="font-semibold mb-1">Магазин</h4>
          <p className="flex items-center">
            {product.source}
            {product.link && !product.link.includes('google.com/shopping') && !product.link.includes('shopping.google') && (
              <span className="ml-2 text-xs text-green-600">(прямая ссылка)</span>
            )}
          </p>
        </div>
      )}
      
      {product.brand && product.brand !== "Не указан" && (
        <div className="mb-4">
          <h4 className="font-semibold mb-1">Бренд</h4>
          <p>{product.brand}</p>
        </div>
      )}
      
      <Button
        onClick={handleOpenStore}
        className="w-full mt-2"
        variant="brand"
      >
        <span className="flex items-center gap-2">
          Перейти в магазин <ExternalLink size={18} />
        </span>
      </Button>
    </div>
  );
};
