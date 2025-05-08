
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageOff, Star, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/services/types";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SearchResultsProps = {
  results: Product[];
  onSelect: (product: Product) => void;
  selectedProduct: Product | null;
  currentPage: number;
  totalPages: number; 
  onPageChange: (page: number) => void;
};

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  onSelect, 
  selectedProduct,
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Состояние для отслеживания загрузки изображений
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  // Состояние для отслеживания ошибок загрузки изображений
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
  // Состояние для текущего продукта в модальном окне
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

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

  // Обработчик для отображения деталей товара
  const handleShowDetails = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailProduct(product);
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
    <div className="space-y-4">
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
                  <div className="text-xs text-gray-500">
                    {product.availability}
                  </div>
                </div>
                
                <div className="flex w-full mt-3 gap-2">
                  {selectedProduct?.id !== product.id ? (
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
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        onClick={(e) => handleShowDetails(product, e)}
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
                          {!product.image || imageError[product.id] ? (
                            <div className="flex flex-col items-center justify-center h-[200px]">
                              <ImageOff size={48} className="text-gray-400" />
                              <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
                            </div>
                          ) : (
                            <img 
                              src={product.image} 
                              alt={product.title} 
                              className="max-h-[300px] object-contain"
                              onError={() => handleImageError(product.id)}
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              size="sm"
            >
              Назад
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Determine which pages to show based on current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => onPageChange(pageNum)}
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              size="sm"
            >
              Вперед
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
