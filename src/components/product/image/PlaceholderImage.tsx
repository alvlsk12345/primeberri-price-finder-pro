
import React from 'react';
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  brandName?: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ 
  size = 'md', 
  text = 'Изображение недоступно',
  brandName
}) => {
  // Определяем размер иконки в зависимости от параметра size
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 32;
  
  // Если указан бренд, добавляем его к тексту
  const displayText = brandName ? `${text} для ${brandName}` : text;
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center w-full h-full bg-gray-50",
      size === 'sm' ? "p-2" : "p-4" 
    )}>
      <div className="flex flex-col items-center justify-center">
        <ImageOff size={iconSize} className="text-gray-400 mb-2" />
        {brandName && (
          <div className={cn(
            "font-medium mb-1 text-center",
            size === 'sm' ? "text-sm" : size === 'lg' ? "text-lg" : "text-base"
          )}>
            {brandName}
          </div>
        )}
        <p className={cn(
          "text-center text-gray-500",
          size === 'sm' ? "text-xs" : size === 'lg' ? "text-base" : "text-sm"
        )}>
          {displayText}
        </p>
      </div>
    </div>
  );
};
