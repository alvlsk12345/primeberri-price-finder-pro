
import React, { useState } from 'react';
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlaceholderImageUrl } from '@/services/imageService';
import { ProductImageModal } from './ProductImageModal';
import { isGoogleCseImage, isGoogleShoppingImage, isZylalabsImage } from '@/services/imageProcessor';

interface ProductImageProps {
  image: string | null;
  title: string;
  productId: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ image, title, productId }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Проверяем, является ли изображение от Google или Zylalabs
  const isGoogleImage = image && (isGoogleShoppingImage(image) || isGoogleCseImage(image));
  const isZylalabs = image && isZylalabsImage(image);
  const useAvatar = isGoogleImage || isZylalabs;

  // Получаем URL заглушки для отображения при ошибке или отсутствии изображения
  const placeholderUrl = getPlaceholderImageUrl(title);

  // Обработчик для ошибок загрузки изображений с улучшенной диагностикой
  const handleImageError = () => {
    console.error('Ошибка загрузки изображения для товара:', {
      productId,
      imageUrl: image,
      isZylalabs: image && isZylalabsImage(image),
      isGoogleImage: isGoogleImage
    });
    
    setImageLoading(false);
    setImageError(true);
  };

  // Обработчик для успешной загрузки изображения
  const handleImageLoad = () => {
    console.log('Изображение успешно загружено:', image);
    setImageLoading(false);
    setImageError(false);
  };
  
  // Обработчик клика по изображению
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    
    // Открываем модальное окно, только если есть изображение и нет ошибки загрузки
    if (image && !imageError) {
      console.log('Открытие модального окна для изображения:', image);
      setIsModalOpen(true);
    } else {
      console.log('Не удалось открыть модальное окно: нет изображения или ошибка загрузки');
    }
  };

  // Если у нас нет изображения
  if (!image) {
    return (
      <div className="w-full h-[150px] mb-3 flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center justify-center">
          <ImageOff size={32} className="text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
        </div>
      </div>
    );
  }

  // Проверяем, является ли URL-адрес уже с CORS-прокси
  const isProxiedUrl = image.includes('corsproxy.io') || 
                       image.includes('cors-anywhere') || 
                       image.includes('proxy.cors');

  // Для изображений от Zylalabs или уже проксированных изображений используем отдельную логику
  if (isZylalabs || isProxiedUrl) {
    return (
      <>
        <div 
          className="w-full h-[150px] mb-3 flex items-center justify-center relative cursor-pointer" 
          onClick={handleImageClick}
        >
          {imageLoading && (
            <Skeleton className="w-full h-full absolute inset-0" />
          )}
          
          <Avatar className="w-full h-full rounded-none">
            <AvatarImage 
              src={image} 
              alt={title}
              className="object-contain"
              onError={handleImageError}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
            <AvatarFallback className="w-full h-full rounded-none bg-gray-100">
              <div className="flex flex-col items-center justify-center">
                <ImageOff size={32} className="text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
              </div>
            </AvatarFallback>
          </Avatar>
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
              <div className="flex flex-col items-center justify-center">
                <ImageOff size={24} className="text-gray-500" />
                <p className="text-xs text-gray-600 mt-1">Ошибка загрузки (Zylalabs)</p>
              </div>
            </div>
          )}
          
          {!imageError && !imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all">
              <div className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                Увеличить
              </div>
            </div>
          )}
        </div>
        
        <ProductImageModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          imageUrl={imageError ? placeholderUrl : image} 
          productTitle={title} 
        />
      </>
    );
  }
  
  // Для Google изображений используем Avatar компонент
  if (isGoogleImage) {
    return (
      <>
        <div 
          className="w-full h-[150px] mb-3 flex items-center justify-center relative cursor-pointer" 
          onClick={handleImageClick}
        >
          {imageLoading && (
            <Skeleton className="w-full h-full absolute inset-0" />
          )}
          
          <Avatar className="w-full h-full rounded-none">
            <AvatarImage 
              src={image} 
              alt={title}
              className="object-contain"
              onError={handleImageError}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
            <AvatarFallback className="w-full h-full rounded-none bg-gray-100">
              <div className="flex flex-col items-center justify-center">
                <ImageOff size={32} className="text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
              </div>
            </AvatarFallback>
          </Avatar>
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
              <div className="flex flex-col items-center justify-center">
                <ImageOff size={24} className="text-gray-500" />
                <p className="text-xs text-gray-600 mt-1">Ошибка загрузки (Google)</p>
              </div>
            </div>
          )}
          
          {!imageError && !imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all">
              <div className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                Увеличить
              </div>
            </div>
          )}
        </div>
        
        <ProductImageModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          imageUrl={imageError ? placeholderUrl : image} 
          productTitle={title} 
        />
      </>
    );
  }

  // Для обычных изображений используем стандартный тег img с запасным URL при ошибке
  return (
    <>
      <div 
        className="w-full h-[150px] mb-3 flex items-center justify-center relative cursor-pointer" 
        onClick={handleImageClick}
      >
        {imageLoading && (
          <Skeleton className="w-full h-full absolute inset-0" />
        )}
        
        <img 
          src={image}
          alt={title}
          className="max-h-full max-w-full object-contain hover:opacity-90 transition-opacity"
          onError={(e) => {
            // При ошибке устанавливаем заглушку
            console.error('Ошибка загрузки изображения, устанавливаем заглушку:', image);
            e.currentTarget.onerror = null; // Предотвращение бесконечной рекурсии
            e.currentTarget.src = placeholderUrl;
            handleImageError();
          }}
          onLoad={handleImageLoad}
          loading="lazy"
          crossOrigin="anonymous"
        />
        
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
            <div className="flex flex-col items-center justify-center">
              <ImageOff size={24} className="text-gray-500" />
              <p className="text-xs text-gray-600 mt-1">Ошибка загрузки</p>
            </div>
          </div>
        )}
        
        {!imageError && !imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all">
            <div className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
              Увеличить
            </div>
          </div>
        )}
      </div>
      
      <ProductImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageUrl={imageError ? placeholderUrl : image} 
        productTitle={title} 
      />
    </>
  );
};
