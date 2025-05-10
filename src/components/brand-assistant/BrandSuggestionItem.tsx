
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandSuggestion } from "@/services/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageOff } from "lucide-react";
import { searchProductImageGoogle } from "@/services/api/googleSearchService";
import { getPlaceholderImageUrl } from "@/services/image/imagePlaceholder";
import { PlaceholderImage } from "@/components/product/image/PlaceholderImage";
import { isProxiedUrl } from "@/services/image/corsProxyService";

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
  const [retryCount, setRetryCount] = useState<number>(0); // Счетчик попыток повторной загрузки

  // Обработчик ошибки загрузки изображения
  const handleImageError = async () => {
    // Отмечаем, что произошла ошибка
    setImageError(true);
    console.log(`Ошибка загрузки изображения для ${suggestion.brand} ${suggestion.product}`);

    // Если уже загружаем изображение, достигли макс. числа попыток, или нет бренда/продукта, то выходим
    if (isImageLoading || retryCount >= 2 || !suggestion.brand || !suggestion.product) {
      console.log(`Прекращаем попытки загрузки для ${suggestion.brand}. Попыток: ${retryCount}`);
      // Используем локальную заглушку
      setImageUrl(getPlaceholderImageUrl(suggestion.brand));
      return;
    }
    
    // Увеличиваем счетчик попыток
    setRetryCount(retryCount + 1);

    // Устанавливаем флаг загрузки
    setIsImageLoading(true);
    
    try {
      // Проверяем, был ли уже применен прокси
      const needsProxy = !isProxiedUrl(imageUrl || '');
      let newImageUrl = '';
      
      if (needsProxy && imageUrl) {
        console.log(`Пробуем применить прокси к текущему URL для ${suggestion.brand}`);
        // Импортируем функцию applyCorsProxy динамически для избежания циклических зависимостей
        const { applyCorsProxy } = await import("@/services/image/corsProxyService");
        newImageUrl = applyCorsProxy(imageUrl);
      } else {
        // Пробуем найти новое изображение через Google CSE API с другим индексом
        console.log(`Поиск запасного изображения через Google CSE для ${suggestion.brand}`);
        newImageUrl = await searchProductImageGoogle(suggestion.brand, suggestion.product, index + retryCount + 5);
      }
      
      if (newImageUrl) {
        // Если нашли изображение, устанавливаем его
        console.log(`Найдена замена изображения для ${suggestion.brand}: ${newImageUrl}`);
        setImageUrl(newImageUrl);
        setImageError(false);
      } else {
        // Если не нашли, используем заглушку
        console.log(`Используем заглушку для ${suggestion.brand}`);
        setImageUrl(getPlaceholderImageUrl(suggestion.brand));
      }
    } catch (error) {
      console.error('Не удалось найти замену изображения:', error);
      // В случае ошибки используем заглушку
      setImageUrl(getPlaceholderImageUrl(suggestion.brand));
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
                  <PlaceholderImage size="sm" text={suggestion.brand} />
                )}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-14 w-14 bg-slate-100 rounded flex items-center justify-center">
              <PlaceholderImage size="sm" text={suggestion.brand} />
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
