
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
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
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg">Изображение товара</DialogTitle>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <div className="flex justify-center items-center p-4">
          <img
            src={displayedImage}
            alt={productTitle || "Изображение товара"}
            className="max-w-full max-h-[70vh] object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
