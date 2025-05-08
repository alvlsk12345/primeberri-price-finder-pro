
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ImageOff, Star, Info, Loader2 } from "lucide-react";
import { Product } from "@/services/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isGoogleShoppingImage } from "@/services/imageService";
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
  // Проверяем, является ли изображение от Google Shopping
  const isGoogleImage = product.image && isGoogleShoppingImage(product.image);
  
  // Состояние для отслеживания загрузки описания
  const [isDescriptionLoaded, setIsDescriptionLoaded] = useState<boolean>(true);
  
  // Состояние для открытия диалога
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // При открытии диалога отмечаем, что описание загружено
  // (т.к. перевод происходит на стороне сервера при загрузке данных)
  useEffect(() => {
    if (isOpen) {
      setIsDescriptionLoaded(true);
    }
  }, [isOpen]);

  // Безопасная проверка на наличие данных и обработка ошибок
  const renderProductDetails = () => {
    try {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center justify-center bg-gray-50 p-4 rounded-md">
            {!product.image ? (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <ImageOff size={48} className="text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
              </div>
            ) : isGoogleImage ? (
              // Для изображений Google Shopping используем Avatar компонент
              <Avatar className="w-full h-[200px] rounded-none">
                <AvatarImage 
                  src={product.image}
                  alt={product.title || "Товар"}
                  className="object-contain"
                />
                <AvatarFallback className="w-full h-full rounded-none bg-gray-100">
                  <div className="flex flex-col items-center justify-center">
                    <ImageOff size={48} className="text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
                  </div>
                </AvatarFallback>
              </Avatar>
            ) : (
              // Для обычных изображений используем стандартный тег img
              <img 
                src={product.image} 
                alt={product.title || "Товар"} 
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
        </div>
      );
    } catch (error) {
      console.error('Ошибка при отображении информации о товаре:', error);
      return (
        <div className="p-4 text-center">
          <p className="text-red-500">Произошла ошибка при загрузке информации о товаре</p>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <Info size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product?.title || "Информация о товаре"}</DialogTitle>
          {product?.subtitle && <DialogDescription>{product.subtitle}</DialogDescription>}
        </DialogHeader>
        
        {renderProductDetails()}
        
        {product?.description && (
          <div className="mt-4">
            <h4 className="font-semibold mb-1">Описание</h4>
            {isDescriptionLoaded ? (
              <p className="text-sm">{product.description}</p>
            ) : (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-gray-500">Загрузка описания...</p>
              </div>
            )}
          </div>
        )}
        
        {product?.specifications && Object.keys(product.specifications).length > 0 && (
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
