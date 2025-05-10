
import React from 'react';
import { ImageOff } from "lucide-react";

interface PlaceholderImageProps {
  size?: 'sm' | 'md' | 'lg';
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ size = 'md' }) => {
  // Определяем размер иконки в зависимости от параметра size
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 32;
  
  return (
    <div className="flex flex-col items-center justify-center">
      <ImageOff size={iconSize} className="text-gray-400" />
      <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
    </div>
  );
};
