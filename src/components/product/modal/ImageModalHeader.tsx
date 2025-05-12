
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ImageModalHeaderProps {
  productTitle: string | null;
}

export const ImageModalHeader: React.FC<ImageModalHeaderProps> = ({ productTitle }) => {
  return (
    <DialogHeader className="mb-4">
      <DialogTitle className="text-center">
        {productTitle || "Изображение товара"}
      </DialogTitle>
      <DialogDescription className="text-center text-sm text-gray-500">
        Нажмите на изображение для увеличения
      </DialogDescription>
    </DialogHeader>
  );
};
