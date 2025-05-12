
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { findProductImage } from "@/services/api/openai/brandSuggestion/imageUtils";
import { PlaceholderImage } from '../product/image/PlaceholderImage';

interface BrandSuggestionItemProps {
  brand: string;
  product: string;
  description: string;
  onSelect: (brand: string, product: string) => void;
  index: number;
}

export const BrandSuggestionItem: React.FC<BrandSuggestionItemProps> = ({
  brand,
  product,
  description,
  onSelect,
  index
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Загружаем изображение при монтировании компонента
  React.useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      try {
        setIsImageLoading(true);
        setImageError(false);
        
        // Получаем URL изображения через API поиска
        const url = await findProductImage(brand, product, index);
        
        if (isMounted) {
          setImageUrl(url);
          setIsImageLoading(false);
        }
      } catch (error) {
        console.error(`Ошибка при загрузке изображения для ${brand} ${product}:`, error);
        if (isMounted) {
          setImageError(true);
          setIsImageLoading(false);
        }
      }
    };

    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [brand, product, index]);

  // Обработчик клика по кнопке поиска
  const handleClick = () => {
    onSelect(brand, product);
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    setImageError(true);
    setIsImageLoading(false);
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-40 overflow-hidden relative bg-gray-100">
        {isImageLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <Skeleton className="h-full w-full absolute" />
          </div>
        ) : imageError || !imageUrl ? (
          <PlaceholderImage size="md" brandName={brand} />
        ) : (
          <img 
            src={imageUrl} 
            alt={`${brand} ${product}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg">{brand}</h3>
          <h4 className="text-sm text-muted-foreground">{product}</h4>
        </div>
        <p className="text-sm mb-3 line-clamp-3">{description}</p>
        <Button 
          onClick={handleClick}
          className="w-full"
          variant="default"
        >
          <Search className="mr-2 h-4 w-4" />
          Поиск в магазинах
        </Button>
      </CardContent>
    </Card>
  );
};
