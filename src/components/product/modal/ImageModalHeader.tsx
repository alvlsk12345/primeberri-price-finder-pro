
import React from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageModalHeaderProps {
  productTitle: string;
}

export const ImageModalHeader: React.FC<ImageModalHeaderProps> = ({ productTitle }) => {
  return (
    <DialogHeader className="space-y-1">
      <DialogTitle>{productTitle}</DialogTitle>
      <div className="text-xs text-gray-500">
        Изображение товара 
        <span className="text-xs text-gray-400 ml-2">
          режим: прямое соединение
        </span>
      </div>
    </DialogHeader>
  );
};
