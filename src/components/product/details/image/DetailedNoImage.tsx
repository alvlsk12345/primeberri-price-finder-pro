
import React from 'react';
import { ImageOff } from "lucide-react";

interface DetailedNoImageProps {
  size?: 'sm' | 'md' | 'lg';
}

export const DetailedNoImage: React.FC<DetailedNoImageProps> = ({ size = 'lg' }) => {
  // Определяем размер иконки в зависимости от параметра size
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  
  return (
    <div className="flex flex-col items-center justify-center h-[200px]">
      <ImageOff size={iconSize} className="text-gray-400" />
      <p className="text-sm text-gray-500 mt-2">Изображение недоступно</p>
    </div>
  );
};
