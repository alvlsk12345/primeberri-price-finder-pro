
import React from 'react';

interface ProductDetailsDescriptionProps {
  description: string | undefined;
  isOpen: boolean;
}

export const ProductDetailsDescription: React.FC<ProductDetailsDescriptionProps> = ({ 
  description,
  isOpen 
}) => {
  if (!description) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-semibold">Описание</h4>
      </div>
      
      <p className="text-sm">{description}</p>
    </div>
  );
};
