
import React from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCurrentProxyName } from '@/services/image/corsProxyService';

interface ImageModalHeaderProps {
  productTitle: string;
}

export const ImageModalHeader: React.FC<ImageModalHeaderProps> = ({ productTitle }) => {
  // Получаем название текущего прокси
  const proxyName = getCurrentProxyName();
  
  return (
    <DialogHeader className="space-y-1">
      <DialogTitle>{productTitle}</DialogTitle>
      <div className="text-xs text-gray-500">
        Изображение товара 
        <span className="text-xs text-gray-400 ml-2">
          прокси: {proxyName}
        </span>
      </div>
    </DialogHeader>
  );
};
