
import React, { useState } from 'react';
import { ImageOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isGoogleShoppingImage, isGoogleCseImage, isZylalabsImage } from "@/services/imageProcessor";
import { getPlaceholderImageUrl } from '@/services/imageService';
import { ProductImageModal } from '../ProductImageModal';

interface ProductDetailsImageProps {
  image: string | null;
  title: string | null;
}

export const ProductDetailsImage: React.FC<ProductDetailsImageProps> = ({ 
  image, 
  title 
}) => {
  // Состояние для модального окна и ошибки загрузки изображения
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Получаем URL заглушки для случая ошибки
  const placeholderUrl = title ? getPlaceholderImageUrl(title) : '';
  
  // Проверяем, является ли изображение от Google или Zylalabs
  const isGoogleImage = image && (isGoogleShoppingImage(image) || isGoogleCseImage(image));
  const isZylalabs = image && isZylalabsImage(image);
  const useAvatar = isGoogleImage || isZylalabs;

  // Обработчик успешной загрузки изображения
  const handleImageLoad = () => {
    console.log('Детальное изображение товара успешно загружено:', image);
    setImageError(false);
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    console.error('Ошибка загрузки детального изображения товара:', image);
    setImageError(true);
  };

  // Обработчик клика по изображению
  const handleImageClick = () => {
    // Открываем модальное окно только если есть изображение и нет ошибки загрузки
    if (image && !imageError) {
      console.log('Открытие модального окна для детального изображения:', image);
      setIsModalOpen(true);
    } else {
      console.log('Не удалось открыть модальное окно для детального изображения: нет изображения или ошибка загрузки');
    }
  };
  
  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px]">
        <ImageOff size={48} className="text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
      </div>
    );
  }
  
  if (useAvatar) {
    // Для изображений Google или Zylalabs используем Avatar компонент
    return (
      <>
        <Avatar 
          className="w-full h-[200px] rounded-none cursor-pointer hover:opacity-90 transition-opacity" 
          onClick={handleImageClick}
        >
          <AvatarImage 
            src={image}
            alt={title || "Товар"}
            className="object-contain"
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
          <AvatarFallback className="w-full h-full rounded-none bg-gray-100">
            <div className="flex flex-col items-center justify-center">
              <ImageOff size={48} className="text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
            </div>
          </AvatarFallback>
        </Avatar>
        
        <ProductImageModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          imageUrl={imageError ? placeholderUrl : image} 
          productTitle={title || "Товар"} 
        />
      </>
    );
  }
  
  // Для обычных изображений используем стандартный тег img
  return (
    <>
      <div className="cursor-pointer hover:opacity-90 transition-opacity" onClick={handleImageClick}>
        <img 
          src={image} 
          alt={title || "Товар"} 
          className="max-h-[300px] object-contain"
          onError={(e) => {
            handleImageError();
            // Устанавливаем заглушку или скрываем изображение при ошибке
            if (placeholderUrl) {
              e.currentTarget.src = placeholderUrl;
            } else {
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
            }
          }}
          onLoad={handleImageLoad}
          loading="lazy"
          crossOrigin="anonymous"
        />
      </div>
      
      <ProductImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageUrl={imageError ? placeholderUrl : image} 
        productTitle={title || "Товар"} 
      />
    </>
  );
};
