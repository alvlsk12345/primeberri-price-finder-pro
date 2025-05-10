
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getPlaceholderImageUrl } from '@/services/imageService';

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
  // Если нет изображения, используем заглушку
  const displayedImage = imageUrl || getPlaceholderImageUrl(productTitle);
  
  // Добавляем логи для отслеживания открытия модального окна и URL изображения
  React.useEffect(() => {
    if (isOpen) {
      console.log('Открытие модального окна с изображением:', {
        imageUrl,
        displayedImage,
        productTitle
      });
    }
  }, [isOpen, imageUrl, displayedImage, productTitle]);

  // Обработчик успешной загрузки изображения
  const handleImageLoad = () => {
    console.log('Изображение в модальном окне успешно загружено:', displayedImage);
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    console.error('Ошибка загрузки изображения в модальном окне:', displayedImage);
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
          <img
            src={displayedImage}
            alt={productTitle || "Изображение товара"}
            className="max-w-full max-h-[70vh] object-contain"
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
