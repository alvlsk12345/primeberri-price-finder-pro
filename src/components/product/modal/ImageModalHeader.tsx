
import React from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageModalHeaderProps {
  productTitle: string | null;
}

export const ImageModalHeader: React.FC<ImageModalHeaderProps> = ({ productTitle }) => {
  return (
    <DialogHeader className="mb-4">
      <DialogTitle className="text-center">
        {productTitle || "Изображение товара"}
      </DialogTitle>
    </DialogHeader>
  );
};
