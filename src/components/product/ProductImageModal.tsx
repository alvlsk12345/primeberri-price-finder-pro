
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getPlaceholderImageUrl } from '@/services/image/imagePlaceholder';
import { useImageModalLoading } from './modal/useImageModalLoading';
import { useImageModalSource } from './modal/useImageModalSource';
import { ImageModalHeader } from './modal/ImageModalHeader';
import { ImageModalContent } from './modal/ImageModalContent';
import { getLargeSizeImageUrl } from '@/services/image/imageProcessor';

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
  // Увеличиваем размер изображения для модального окна если возможно
  const optimizedImageUrl = imageUrl ? getLargeSizeImageUrl(imageUrl) : null;
  
  // Если нет изображения, используем заглушку
  const displayedImage = optimizedImageUrl || getPlaceholderImageUrl(productTitle);
  
  // Используем хуки для обработки загрузки и определения источника изображения
  const loadingState = useImageModalLoading(optimizedImageUrl);
  const sourceInfo = useImageModalSource(optimizedImageUrl);
  
  // Состояние для хранения попыток восстановления
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);
  
  const MAX_RETRIES = 2;
  
  // Подробное логирование открытия модального окна
  useEffect(() => {
    if (isOpen) {
      console.log('Открытие модального окна с изображением:', {
        originalImageUrl: imageUrl,
        optimizedImageUrl,
        displayedImage,
        productTitle,
        useAvatar: sourceInfo.useAvatar,
        isGoogleImage: sourceInfo.isGoogleImage,
        isZylalabs: sourceInfo.isZylalabs,
      });
    }
  }, [isOpen, imageUrl, optimizedImageUrl, displayedImage, productTitle, sourceInfo]);
  
  // Система повторных попыток для загрузки изображения
  useEffect(() => {
    const { imageError } = loadingState;
    
    // Только если окно открыто, изображение доступно и произошла ошибка
    if (isOpen && optimizedImageUrl && imageError && retryCount < MAX_RETRIES) {
      // Задержка перед повторной попыткой
      const timer = setTimeout(() => {
        console.log(`Повторная попытка загрузки изображения в модальном окне ${retryCount + 1}/${MAX_RETRIES}`);
        
        // Добавляем уникальный параметр к URL для избежания кэширования
        setRetryCount(prev => prev + 1);
        setFallbackImage(`${optimizedImageUrl}?retry=${Date.now()}`);
      }, 800 * (retryCount + 1));
      
      return () => clearTimeout(timer);
    } else if (isOpen && imageError && retryCount >= MAX_RETRIES) {
      // Если все попытки исчерпаны, используем заглушку
      console.log(`Все ${MAX_RETRIES} попытки загрузки изображения в модальном окне исчерпаны, используем заглушку`);
      setFallbackImage(getPlaceholderImageUrl(productTitle));
    }
  }, [loadingState.imageError, retryCount, isOpen, optimizedImageUrl, productTitle]);
  
  // Итоговый URL с учетом попыток восстановления
  const finalImageUrl = fallbackImage || displayedImage;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <ImageModalHeader productTitle={productTitle} />
        <ImageModalContent 
          displayedImage={finalImageUrl} 
          productTitle={productTitle} 
          loadingState={loadingState}
          sourceInfo={sourceInfo}
          retryCount={retryCount}
          maxRetries={MAX_RETRIES}
        />
      </DialogContent>
    </Dialog>
  );
};
