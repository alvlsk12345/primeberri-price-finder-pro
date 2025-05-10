
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandSuggestion } from "@/services/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageOff } from "lucide-react";
import { searchProductImageGoogle } from "@/services/api/googleSearchService";
import { getPlaceholderImageUrl } from "@/services/image/imagePlaceholder";

interface BrandSuggestionItemProps {
  suggestion: BrandSuggestion;
  onSelect: () => void;
  index?: number;
}

export const BrandSuggestionItem: React.FC<BrandSuggestionItemProps> = ({ 
  suggestion, 
  onSelect,
  index = 0
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(suggestion.imageUrl);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;

  // Обработчик ошибки загрузки изображения с улучшенным механизмом повтора
  const handleImageError = async () => {
    // Отмечаем, что произошла ошибка
    setImageError(true);
    console.log(`Ошибка загрузки изображения для ${suggestion.brand} ${suggestion.product}`);

    // Если уже загружаем изображение, превысили лимит попыток или нет бренда/продукта, то выходим
    if (isImageLoading || retryCount >= MAX_RETRIES || !suggestion.brand || !suggestion.product) {
      console.log(`Не пытаемся повторить запрос: загрузка=${isImageLoading}, попытки=${retryCount}/${MAX_RETRIES}`);
      // Если все попытки исчерпаны, устанавливаем заглушку
      if (retryCount >= MAX_RETRIES) {
        console.log(`Исчерпаны все ${MAX_RETRIES} попытки. Устанавливаем заглушку.`);
        setImageUrl(getPlaceholderImageUrl(suggestion.brand));
      }
      return;
    }

    // Устанавливаем флаг загрузки и увеличиваем счетчик попыток
    setIsImageLoading(true);
    setRetryCount(prev => prev + 1);
    
    try {
      // Рассчитываем индекс для поиска другого изображения (увеличиваем с каждой попыткой)
      const newIndex = index + 5 + retryCount;
      
      // Пробуем использовать Google CSE API с другим индексом
      console.log(`Поиск запасного изображения через Google CSE для ${suggestion.brand} (попытка ${retryCount + 1}/${MAX_RETRIES}, индекс=${newIndex})`);
      let newImageUrl = await searchProductImageGoogle(suggestion.brand, suggestion.product, newIndex);
      
      if (newImageUrl) {
        // Если нашли изображение, устанавливаем его
        console.log(`Найдена замена изображения для ${suggestion.brand} (попытка ${retryCount + 1})`);
        setImageUrl(newImageUrl);
        setImageError(false);
      } else {
        console.log(`Не удалось найти замену изображения (попытка ${retryCount + 1})`);
        // Если все попытки исчерпаны, устанавливаем заглушку
        if (retryCount >= MAX_RETRIES - 1) {
          setImageUrl(getPlaceholderImageUrl(suggestion.brand));
        }
      }
    } catch (error) {
      console.error('Не удалось найти замену изображения:', error);
      // Если все попытки исчерпаны, устанавливаем заглушку
      if (retryCount >= MAX_RETRIES - 1) {
        setImageUrl(getPlaceholderImageUrl(suggestion.brand));
      }
    } finally {
      // Сбрасываем флаг загрузки
      setIsImageLoading(false);
    }
  };

  return (
    <div className="p-2 bg-white rounded border hover:bg-slate-50 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex gap-3">
          {(imageUrl || !imageError) ? (
            <Avatar className="h-14 w-14 rounded">
              <AvatarImage 
                src={imageUrl} 
                alt={suggestion.product}
                className="object-cover" 
                onError={handleImageError}
                crossOrigin="anonymous"
              />
              <AvatarFallback className="bg-slate-100">
                {isImageLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full" />
                ) : (
                  <ImageOff size={16} className="text-slate-400" />
                )}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-14 w-14 bg-slate-100 rounded flex items-center justify-center">
              <ImageOff size={20} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium">{suggestion.brand}</p>
            <p className="text-sm">{suggestion.product}</p>
            <p className="text-xs text-gray-600">{suggestion.description}</p>
          </div>
        </div>
        <Button 
          variant="brand" 
          size="sm" 
          className="self-start sm:self-center whitespace-nowrap"
          onClick={onSelect}
        >
          Искать этот товар
        </Button>
      </div>
    </div>
  );
};
