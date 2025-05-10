
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getPlaceholderImageUrl } from '@/services/imageService';
import { isZylalabsImage, isGoogleCseImage, isGoogleShoppingImage } from '@/services/imageProcessor';
import { ImageOff } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  productTitle: string;
}

export const ProductImageModal: React.FC<ProductImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  productTitle
}) => {
  // Состояние для отслеживания ошибок загрузки изображения
  const [imageError, setImageError] = useState(false);
  
  // Если нет изображения, используем заглушку
  const displayedImage = imageUrl || getPlaceholderImageUrl(productTitle);
  
  // Проверяем источник изображения для специальной обработки
  const isSpecialSource = Boolean(imageUrl && (
    isZylalabsImage(imageUrl) || 
    isGoogleCseImage(imageUrl) || 
    isGoogleShoppingImage(imageUrl) || 
    imageUrl.includes('encrypted-tbn')
  ));
  
  // Проверяем, является ли URL уже проксированным
  const isProxiedUrl = Boolean(imageUrl && (
    imageUrl.includes('corsproxy.io') || 
    imageUrl.includes('cors-anywhere') || 
    imageUrl.includes('proxy.cors')
  ));
  
  // Решаем, использовать ли Avatar компонент для изображения
  const useAvatar = isSpecialSource || isProxiedUrl;
  
  // Добавляем логи для отслеживания открытия модального окна и URL изображения
  React.useEffect(() => {
    if (isOpen) {
      console.log('Открытие модального окна с изображением:', {
        imageUrl,
        displayedImage,
        productTitle,
        isSpecialSource,
        isProxiedUrl,
        useAvatar
      });
      
      // Сбрасываем состояние ошибки при каждом открытии модального окна
      setImageError(false);
    }
  }, [isOpen, imageUrl, displayedImage, productTitle, isSpecialSource, isProxiedUrl, useAvatar]);

  // Обработчик успешной загрузки изображения
  const handleImageLoad = () => {
    console.log('Изображение в модальном окне успешно загружено:', displayedImage);
    setImageError(false);
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    console.error('Ошибка загрузки изображения в модальном окне:', displayedImage);
    setImageError(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg">{productTitle || "Изображение товара"}</DialogTitle>
        </DialogHeader>
        
        <DialogDescription className="sr-only">
          Изображение товара: {productTitle}
        </DialogDescription>
        
        <div className="flex justify-center items-center p-4">
          {useAvatar ? (
            // Используем Avatar для изображений с CORS-проблемами
            <Avatar className="w-full h-[70vh] rounded-none">
              <AvatarImage
                src={displayedImage}
                alt={productTitle || "Изображение товара"}
                className="object-contain max-h-[70vh] max-w-full"
                onError={handleImageError}
                onLoad={handleImageLoad}
                crossOrigin="anonymous"
              />
              <AvatarFallback className="w-full h-full rounded-none bg-gray-100 flex flex-col items-center justify-center">
                <ImageOff size={48} className="text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
              </AvatarFallback>
            </Avatar>
          ) : (
            // Для обычных изображений используем стандартный тег img
            <img
              src={displayedImage}
              alt={productTitle || "Изображение товара"}
              className="max-w-full max-h-[70vh] object-contain"
              loading="lazy"
              onLoad={handleImageLoad}
              onError={(e) => {
                handleImageError();
                // Устанавливаем заглушку при ошибке
                const placeholderUrl = getPlaceholderImageUrl(productTitle);
                e.currentTarget.onerror = null; // Предотвращаем бесконечную рекурсию
                e.currentTarget.src = placeholderUrl;
              }}
              crossOrigin="anonymous"
            />
          )}
          
          {/* Показываем сообщение об ошибке, если не удалось загрузить изображение */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
              <div className="flex flex-col items-center justify-center">
                <ImageOff size={48} className="text-gray-500" />
                <p className="text-sm text-gray-600 mt-2">Ошибка загрузки изображения</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
