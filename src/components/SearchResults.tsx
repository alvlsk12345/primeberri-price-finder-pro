
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageOff, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/services/types";

type SearchResultsProps = {
  results: Product[];
  onSelect: (product: Product) => void;
  selectedProduct: Product | null;
};

export const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelect, selectedProduct }) => {
  // Состояние для отслеживания загрузки изображений
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  // Состояние для отслеживания ошибок загрузки изображений
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});

  // Обработчик для ошибок загрузки изображений
  const handleImageError = (productId: string) => {
    console.error('Ошибка загрузки изображения для товара:', productId);
    
    // Отмечаем, что загрузка этого изображения завершена с ошибкой
    setImageLoading(prev => ({ ...prev, [productId]: false }));
    setImageError(prev => ({ ...prev, [productId]: true }));
  };

  // Обработчик для успешной загрузки изображения
  const handleImageLoad = (productId: string) => {
    setImageLoading(prev => ({ ...prev, [productId]: false }));
    setImageError(prev => ({ ...prev, [productId]: false }));
  };

  // Обработчик для начала загрузки изображения
  const handleImageLoadStart = (productId: string) => {
    setImageLoading(prev => ({ ...prev, [productId]: true }));
    setImageError(prev => ({ ...prev, [productId]: false }));
  };

  console.log('Рендерим результаты поиска:', results);

  if (results.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-lg text-gray-500">Товары не найдены.</p>
      </div>
    );
  }

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
              <div className="relative w-full">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl-md z-10">
                  {product.subtitle}
                </div>
              </div>
              
              <div className="w-full h-[150px] mb-3 flex items-center justify-center relative">
                {imageLoading[product.id] && (
                  <Skeleton className="w-full h-full absolute inset-0" />
                )}
                
                {imageError[product.id] || !product.image ? (
                  <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100">
                    <ImageOff size={32} className="text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
                  </div>
                ) : (
                  <img 
                    src={product.image}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain"
                    onError={() => handleImageError(product.id)}
                    onLoad={() => handleImageLoad(product.id)}
                    loading="lazy"
                    onLoadStart={() => handleImageLoadStart(product.id)}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                )}
              </div>
              
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
}
