
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getPlaceholderImageUrl } from '@/services/imageService';
import { useImageModalLoading } from './modal/useImageModalLoading';
import { useImageModalSource } from './modal/useImageModalSource';
import { ImageModalHeader } from './modal/ImageModalHeader';
import { ImageModalContent } from './modal/ImageModalContent';

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
  
  // Используем хуки для обработки загрузки и определения источника изображения
  const loadingState = useImageModalLoading(imageUrl);
  const sourceInfo = useImageModalSource(imageUrl);
  
  React.useEffect(() => {
    if (isOpen) {
      console.log('Открытие модального окна с изображением:', {
        imageUrl,
        displayedImage,
        productTitle,
        useAvatar: sourceInfo.useAvatar,
        isGoogleImage: sourceInfo.isGoogleImage,
        isZylalabs: sourceInfo.isZylalabs,
        isProxiedUrl: sourceInfo.isProxiedUrl
      });
    }
  }, [isOpen, imageUrl, displayedImage, productTitle, sourceInfo]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <ImageModalHeader productTitle={productTitle} />
        <ImageModalContent 
          displayedImage={displayedImage} 
          productTitle={productTitle} 
          loadingState={loadingState}
          sourceInfo={sourceInfo}
        />
      </DialogContent>
    </Dialog>
  );
};
