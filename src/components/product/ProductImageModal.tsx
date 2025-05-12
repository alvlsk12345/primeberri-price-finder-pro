
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getPlaceholderImageUrl } from '@/services/image/imagePlaceholder';
import { useImageModalLoading } from './modal/useImageModalLoading';
import { useImageModalSource } from './modal/useImageModalSource';
import { ImageModalHeader } from './modal/ImageModalHeader';
import { ImageModalContent } from './modal/ImageModalContent';
import { getLargeSizeImageUrl } from '@/services/image/imageProcessor';
import { getProxiedImageUrl } from '@/services/image';

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
  // Определяем источник изображения перед оптимизацией
  const sourceInfo = useImageModalSource(imageUrl);
  
  // Увеличиваем размер изображения для модального окна если возможно
  // Для Zylalabs и Google Thumbnail использовать прямую загрузку (directFetch=true)
  const optimizedImageUrl = imageUrl ? 
    (sourceInfo.needsDirectFetch ? 
      getProxiedImageUrl(imageUrl, true, true) : 
      getLargeSizeImageUrl(imageUrl)) : null;
  
  // Если нет изображения, используем заглушку
  const displayedImage = optimizedImageUrl || getPlaceholderImageUrl(productTitle);
  
  // Используем хуки для обработки загрузки изображения
  const loadingState = useImageModalLoading(optimizedImageUrl);
  
  // Состояние для хранения попыток восстановления
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);
  
  const MAX_RETRIES = 3; // Увеличиваем с 2 до 3
  
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
        isGoogleThumbnail: sourceInfo.isGoogleThumbnail,
        needsDirectFetch: sourceInfo.needsDirectFetch
      });
    }
  }, [isOpen, imageUrl, optimizedImageUrl, displayedImage, productTitle, sourceInfo]);
  
  // Система повторных попыток для загрузки изображения
  useEffect(() => {
    const { imageError } = loadingState;
    
    // Только если окно открыто, изображение доступно и произошла ошибка
    if (isOpen && optimizedImageUrl && imageError && retryCount < MAX_RETRIES) {
      // Задержка перед повторной попыткой
      const delay = 800 * (retryCount + 1);
      const timer = setTimeout(() => {
        console.log(`Повторная попытка загрузки изображения в модальном окне ${retryCount + 1}/${MAX_RETRIES}`);
        
        // Для Zylalabs и Google Thumbnail используем принудительную прямую загрузку
        let newUrl: string;
        if (sourceInfo.isZylalabs || sourceInfo.isGoogleThumbnail) {
          newUrl = getProxiedImageUrl(imageUrl || '', true, true) + `&retry=${Date.now()}`;
        } else {
          // Добавляем уникальный параметр к URL для избежания кэширования
          newUrl = `${optimizedImageUrl}?retry=${Date.now()}-${retryCount}`;
        }
        
        setRetryCount(prev => prev + 1);
        setFallbackImage(newUrl);
        
        console.log('Новый URL для повторной попытки:', {
          original: optimizedImageUrl,
          new: newUrl,
          retryCount: retryCount + 1,
          isZylalabs: sourceInfo.isZylalabs,
          isGoogleThumb: sourceInfo.isGoogleThumbnail
        });
      }, delay);
      
      return () => clearTimeout(timer);
    } else if (isOpen && imageError && retryCount >= MAX_RETRIES) {
      // Если все попытки исчерпаны, используем заглушку
      console.log(`Все ${MAX_RETRIES} попытки загрузки изображения в модальном окне исчерпаны, используем заглушку`);
      setFallbackImage(getPlaceholderImageUrl(productTitle));
    }
  }, [loadingState.imageError, retryCount, isOpen, optimizedImageUrl, productTitle, imageUrl, sourceInfo, MAX_RETRIES]);
  
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
