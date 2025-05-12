
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getPlaceholderImageUrl } from '@/services/image/imagePlaceholder';
import { useImageModalLoading } from './modal/useImageModalLoading';
import { useImageModalSource } from './modal/useImageModalSource';
import { ImageModalHeader } from './modal/ImageModalHeader';
import { ImageModalContent } from './modal/ImageModalContent';
import { getLargeSizeImageUrl } from '@/services/image/imageProcessor';
import { getProxiedImageUrl } from '@/services/image';
import { toast } from 'sonner';

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
  // Для Zylalabs и Google Thumbnail используем правильную обработку
  const optimizedImageUrl = React.useMemo(() => {
    if (!imageUrl) return null;
    
    // Для Google Thumbnail и Zylalabs используем специальную обработку
    if (sourceInfo.isGoogleThumbnail || sourceInfo.isZylalabs) {
      // Если URL уже содержит прокси, просто добавляем параметры
      if (imageUrl.includes('juacmpkewomkducoanle.supabase.co/functions/v1/image-proxy')) {
        let finalUrl = imageUrl;
        
        // Добавляем forceDirectFetch если его нет
        if (!finalUrl.includes('forceDirectFetch=true')) {
          finalUrl += '&forceDirectFetch=true';
        }
        
        // Добавляем timestamp для предотвращения кэширования
        finalUrl += `&_t=${Date.now()}`;
        return finalUrl;
      } else {
        // Создаем проксированный URL с нужными параметрами
        return getProxiedImageUrl(imageUrl, true, true) + `&forceDirectFetch=true&_t=${Date.now()}`;
      }
    }
    
    // Для остальных изображений используем стандартный метод увеличения размера
    return getLargeSizeImageUrl(imageUrl);
  }, [imageUrl, sourceInfo]);
  
  // Если нет изображения, используем заглушку
  const displayedImage = optimizedImageUrl || getPlaceholderImageUrl(productTitle);
  
  // Используем хуки для обработки загрузки изображения
  const loadingState = useImageModalLoading(optimizedImageUrl);
  
  // Состояние для хранения попыток восстановления
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);
  
  const MAX_RETRIES = 5; // Увеличиваем количество попыток
  
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
      
      // Показываем уведомление для отладки при загрузке специальных типов изображений
      if (sourceInfo.isZylalabs) {
        console.log('Загрузка изображения из Zylalabs с прямым прокси запросом');
        toast.info('Загрузка изображения Zylalabs', {
          duration: 2000,
          description: 'Используется прямой прокси запрос'
        });
      } else if (sourceInfo.isGoogleThumbnail) {
        console.log('Загрузка миниатюры Google с прямым прокси запросом');
        toast.info('Загрузка миниатюры Google', {
          duration: 2000, 
          description: 'Используется прямой прокси запрос'
        });
      }
    }
  }, [isOpen, imageUrl, optimizedImageUrl, displayedImage, productTitle, sourceInfo]);
  
  // Система повторных попыток для загрузки изображения с улучшенной логикой
  useEffect(() => {
    const { imageError } = loadingState;
    
    // Только если окно открыто, изображение доступно и произошла ошибка
    if (isOpen && optimizedImageUrl && imageError && retryCount < MAX_RETRIES) {
      // Задержка перед повторной попыткой (увеличивается с каждой попыткой)
      const delay = 800 * (retryCount + 1);
      const timer = setTimeout(() => {
        console.log(`Повторная попытка загрузки изображения в модальном окне ${retryCount + 1}/${MAX_RETRIES}`);
        
        // Формируем новый URL в зависимости от типа изображения
        let newUrl: string;
        
        // Для Google Thumbnails и Zylalabs используем специальную стратегию
        if (sourceInfo.isGoogleThumbnail || sourceInfo.isZylalabs) {
          // Определяем базовый URL
          const baseUrl = imageUrl || '';
          const isAlreadyProxied = baseUrl.includes('juacmpkewomkducoanle.supabase.co/functions/v1/image-proxy');
          
          if (isAlreadyProxied) {
            // Если URL уже с прокси, добавляем только новый timestamp
            const urlWithoutTime = baseUrl.replace(/&_t=\d+(-\d+)?/, '');
            newUrl = `${urlWithoutTime}&forceDirectFetch=true&_t=${Date.now()}-${retryCount}`;
          } else {
            // Создаем новый проксированный URL
            newUrl = getProxiedImageUrl(baseUrl, true, true) + 
              `&forceDirectFetch=true&_t=${Date.now()}-${retryCount}`;
          }
          
          const sourceType = sourceInfo.isZylalabs ? 'Zylalabs' : 'миниатюры Google';
          toast.info(`Повторная попытка (${retryCount + 1}/${MAX_RETRIES})`, {
            description: `Загрузка изображения ${sourceType}`
          });
        } else {
          // Для обычных изображений добавляем уникальный параметр к URL
          if (optimizedImageUrl.includes('?')) {
            newUrl = `${optimizedImageUrl}&retry=${Date.now()}-${retryCount}`;
          } else {
            newUrl = `${optimizedImageUrl}?retry=${Date.now()}-${retryCount}`;
          }
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
      // Если все попытки исчерпаны, используем заглушку и показываем сообщение
      console.log(`Все ${MAX_RETRIES} попытки загрузки изображения в модальном окне исчерпаны, используем заглушку`);
      setFallbackImage(getPlaceholderImageUrl(productTitle));
      
      // Показываем сообщение об ошибке, если это Zylalabs или Google Thumbnail
      if (sourceInfo.isZylalabs) {
        toast.error(`Не удалось загрузить изображение из Zylalabs после ${MAX_RETRIES} попыток`, {
          description: 'Возможно, изображение недоступно или требует авторизации'
        });
      } else if (sourceInfo.isGoogleThumbnail) {
        toast.error(`Не удалось загрузить миниатюру Google после ${MAX_RETRIES} попыток`, {
          description: 'Возможно, изображение недоступно'
        });
      }
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
