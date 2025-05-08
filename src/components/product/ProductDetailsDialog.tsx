
import React from 'react';
import { Button } from "@/components/ui/button";
import { ImageOff, Star, Info } from "lucide-react";
import { Product } from "@/services/types";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProductDetailsDialogProps {
  product: Product;
}

export const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({ product }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={(e) => e.stopPropagation()}
        >
          <Info size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription>{product.subtitle}</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center justify-center bg-gray-50 p-4 rounded-md">
            {!product.image ? (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <ImageOff size={48} className="text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
              </div>
            ) : (
              <img 
                src={product.image} 
                alt={product.title} 
                className="max-h-[300px] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const container = target.parentElement;
                  if (container) {
                    const fallback = document.createElement('div');
                    fallback.className = "flex flex-col items-center justify-center h-[200px]";
                    fallback.innerHTML = `
                      <svg width="48" height="48" class="text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 8.688C3 7.192 4.206 6 5.714 6h12.572C19.794 6 21 7.192 21 8.688v6.624C21 16.808 19.794 18 18.286 18H5.714C4.206 18 3 16.808 3 15.312V8.688z" stroke="currentColor" stroke-width="2"/>
                        <path d="M9.5 11.5l-2 2M21 6l-3.5 3.5M13.964 12.036l-2.036 2.036" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      <p class="text-sm text-gray-500 mt-2">Изображение недоступно</p>
                    `;
                    container.appendChild(fallback);
                  }
                }}
              />
            )}
          </div>
          
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold">Цена: {product.price}</h3>
              <p className="text-sm">{product.availability}</p>
              <div className="flex items-center mt-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="ml-1">{product.rating}/5</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-1">Магазин</h4>
              <p>{product.source}</p>
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
        </div>
        
        {product.description && (
          <div className="mt-4">
            <h4 className="font-semibold mb-1">Описание</h4>
            <p className="text-sm">{product.description}</p>
          </div>
        )}
        
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-1">Характеристики</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}: </span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
