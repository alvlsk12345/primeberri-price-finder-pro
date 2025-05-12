
import React, { useEffect, useState } from "react";
import { BrandSuggestion } from "@/services/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { findProductImage } from "@/services/api/openai/brandSuggestion/imageUtils";
import { PlaceholderImage } from "@/components/product/image/PlaceholderImage";
import { Skeleton } from "@/components/ui/skeleton";

interface BrandSuggestionItemProps {
  suggestion: BrandSuggestion;
  onSelect: (immediate?: boolean) => void;
  index: number;
}

export const BrandSuggestionItem: React.FC<BrandSuggestionItemProps> = ({ 
  suggestion, 
  onSelect, 
  index 
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [isImageError, setIsImageError] = useState<boolean>(false);
  
  const brand = suggestion.brand || suggestion.name || '';
  const product = suggestion.product || 
    (Array.isArray(suggestion.products) && suggestion.products.length > 0 
      ? suggestion.products[0] 
      : '');
  const description = suggestion.description || '';

  // Добавляем небольшую задержку для анимации появления элементов
  const animationDelay = `${index * 50}ms`;

  // Загружаем изображение товара при монтировании компонента
  useEffect(() => {
    let isMounted = true;
    setIsImageLoading(true);
    
    const loadImage = async () => {
      try {
        console.log(`Загрузка изображения для ${brand} ${product}, индекс: ${index}`);
        const url = await findProductImage(brand, product, index);
        
        if (isMounted) {
          console.log(`Получен URL изображения: ${url}`);
          setImageUrl(url);
          setIsImageLoading(false);
          setIsImageError(false);
        }
      } catch (error) {
        console.error(`Ошибка при загрузке изображения для ${brand} ${product}:`, error);
        
        if (isMounted) {
          setIsImageLoading(false);
          setIsImageError(true);
        }
      }
    };
    
    if (brand || product) {
      loadImage();
    } else {
      setIsImageLoading(false);
      setIsImageError(true);
    }
    
    return () => {
      isMounted = false;
    };
  }, [brand, product, index]);

  return (
    <div 
      className={cn(
        "p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-all",
        "animate-fade-in" // Анимация появления
      )}
      style={{ animationDelay }}
    >
      <div className="flex flex-col space-y-3">
        {/* Секция с изображением товара */}
        <div className="w-full h-40 overflow-hidden rounded-md bg-gray-50 mb-2">
          {isImageLoading ? (
            <Skeleton className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse text-gray-400">
                <span className="sr-only">Загрузка изображения...</span>
              </div>
            </Skeleton>
          ) : isImageError || !imageUrl ? (
            <PlaceholderImage text={brand || "Нет изображения"} />
          ) : (
            <img 
              src={imageUrl} 
              alt={`${brand} ${product}`} 
              className="w-full h-full object-contain" 
              onError={() => setIsImageError(true)}
            />
          )}
        </div>
        
        {/* Информация о товаре */}
        <div className="flex justify-between items-start">
          <h4 className="text-sm">
            <span className="font-bold text-gray-900">{brand}</span>
            {product && <span className="ml-1 text-gray-700">— {product}</span>}
          </h4>
        </div>
        
        {description && (
          <p className="text-xs text-gray-600">{description}</p>
        )}
        
        {/* Кнопка запуска поиска */}
        <div className="flex justify-end pt-1">
          <Button 
            onClick={() => onSelect(true)} 
            variant="brand" 
            size="sm" 
            className="h-8"
          >
            <Search size={16} className="mr-1" />
            Поиск в магазинах
          </Button>
        </div>
      </div>
    </div>
  );
};
