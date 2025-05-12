
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { findProductImage } from "@/services/api/openai/brandSuggestion/imageUtils";
import { PlaceholderImage } from '../product/image/PlaceholderImage';
import { BrandSuggestion } from "@/services/types";

interface BrandSuggestionItemProps {
  brand: string;
  product: string;
  description: string;
  onSelect: (brand: string, product: string, immediate?: boolean) => void;
  index: number;
}

// Альтернативный интерфейс с объектом suggestion
interface BrandSuggestionItemWithObjectProps {
  suggestion: BrandSuggestion;
  onSelect: (immediate?: boolean) => void;
  index: number;
}

// Объединенный тип для поддержки обоих форматов пропсов
type CombinedBrandSuggestionItemProps = BrandSuggestionItemProps | BrandSuggestionItemWithObjectProps;

export const BrandSuggestionItem: React.FC<CombinedBrandSuggestionItemProps> = (props) => {
  // Определяем тип пропсов и извлекаем данные
  const isSuggestionObject = 'suggestion' in props;
  
  // Извлекаем необходимые данные в зависимости от формата пропсов
  const brand = isSuggestionObject ? props.suggestion.brand : props.brand;
  const product = isSuggestionObject ? props.suggestion.product : props.product;
  const description = isSuggestionObject ? props.suggestion.description : props.description;
  const index = props.index;
  
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
    // Показываем уведомление о начале поиска
    toast.loading('Идет поиск, пожалуйста подождите', {
      id: 'brand-search-toast',
      duration: 0
    });

    setTimeout(() => {
      if (isSuggestionObject) {
        props.onSelect(true); // Используем булево значение для immediate
      } else {
        props.onSelect(brand, product, true); // Используем третий параметр для immediate
      }
      
      // Закрываем уведомление о загрузке через небольшую задержку
      setTimeout(() => {
        toast.dismiss('brand-search-toast');
      }, 1000);
    }, 100);
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    setImageError(true);
    setIsImageLoading(false);
  };

  return (
    <Card className="overflow-hidden h-full">
      <div className="h-28 overflow-hidden relative bg-gray-100">
        {isImageLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <Skeleton className="h-full w-full absolute" />
          </div>
        ) : imageError || !imageUrl ? (
          <PlaceholderImage size="sm" brandName={brand} />
        ) : (
          <img 
            src={imageUrl} 
            alt={`${brand} ${product}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
      </div>
      
      <CardContent className="p-3">
        <div className="mb-1.5">
          <h3 className="font-medium text-base truncate">{brand}</h3>
          <h4 className="text-xs text-muted-foreground truncate">{product}</h4>
        </div>
        <p className="text-xs mb-2 line-clamp-2 text-muted-foreground">{description}</p>
        <Button 
          onClick={handleClick}
          className="w-full h-8 text-xs py-0 px-2"
          variant="default"
        >
          <Search className="mr-1 h-3 w-3" />
          Поиск в магазинах
        </Button>
      </CardContent>
    </Card>
  );
};
