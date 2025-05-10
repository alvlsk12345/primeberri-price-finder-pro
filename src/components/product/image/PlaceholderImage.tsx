
import React from 'react';
import { ImageOff } from "lucide-react";

interface PlaceholderImageProps {
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ size = 'md', title }) => {
  // Определяем размер иконки в зависимости от параметра size
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 32;
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <ImageOff size={iconSize} className="text-gray-400" />
      <p className="text-sm text-gray-500 mt-2">{title || 'Изображение недоступно'}</p>
    </div>
  );
};
