
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ImageModalHeaderProps {
  productTitle: string | null;
}

export const ImageModalHeader: React.FC<ImageModalHeaderProps> = ({ productTitle }) => {
  return (
    <>
      <DialogHeader className="flex flex-row items-center justify-between">
        <DialogTitle className="text-lg">{productTitle || "Изображение товара"}</DialogTitle>
      </DialogHeader>
      
      <DialogDescription className="sr-only">
        Изображение товара: {productTitle}
      </DialogDescription>
    </>
  );
};
