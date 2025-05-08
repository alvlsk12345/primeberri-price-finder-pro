
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Info, Languages } from "lucide-react";
import { Product } from "@/services/types";
import { ProductImage } from './ProductImage';
import { ProductDetailsDialog } from './ProductDetailsDialog';
import { translateText, containsRussian } from "@/services/translationService";
import { toast } from "sonner";
import { MiniCostCalculator } from './MiniCostCalculator';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Loader2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected, onSelect }) => {
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [displayedTitle, setDisplayedTitle] = useState<string>(product.title);
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [originalTitle, setOriginalTitle] = useState<string>(product.title);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  
  // Новые состояния для перевода описания в всплывающем окне
  const [translatedDescription, setTranslatedDescription] = useState<string>("");
  const [isDescriptionTranslated, setIsDescriptionTranslated] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  
  // Функция для перевода заголовка товара
  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем выбор товара при нажатии на кнопку перевода
    
    try {
      setIsTranslating(true);
      
      // Определяем направление перевода
      const sourceLanguage = isTranslated ? "ru" : "en";
      const targetLanguage = isTranslated ? "en" : "ru";
      
      // Если это первый перевод, сохраняем оригинальный текст
      if (!isTranslated && originalTitle === product.title) {
        setOriginalTitle(product.title);
      }
      
      // Если уже переведен, возвращаем оригинал
      if (isTranslated) {
        setDisplayedTitle(originalTitle);
        setIsTranslated(false);
        toast("Отображен оригинальный текст");
      } else {
        // Выполняем перевод
        const translated = await translateText(
          displayedTitle, 
          sourceLanguage, 
          targetLanguage
        );
        
        setDisplayedTitle(translated);
        setIsTranslated(true);
        toast(`Текст переведен на ${targetLanguage === "ru" ? "русский" : "английский"}`);
      }
    } catch (error) {
      console.error("Ошибка при переводе:", error);
      toast("Не удалось перевести текст");
    } finally {
      setIsTranslating(false);
    }
  };

  // Новая функция для перевода описания товара
  const handleTranslateDescription = async () => {
    if (!product.description) {
      toast("Нет описания для перевода");
      return;
    }
    
    try {
      setIsTranslating(true);
      setIsPopoverOpen(true);
      
      // Если у нас уже есть переведенное описание, просто переключаем флаг
      if (isDescriptionTranslated && translatedDescription) {
        setIsDescriptionTranslated(false);
        toast("Отображено оригинальное описание");
      } else {
        // Выполняем перевод
        const sourceLanguage = "en";
        const targetLanguage = "ru";
        
        const translated = await translateText(
          product.description,
          sourceLanguage,
          targetLanguage
        );
        
        setTranslatedDescription(translated);
        setIsDescriptionTranslated(true);
        toast(`Описание переведено на ${targetLanguage === "ru" ? "русский" : "английский"}`);
      }
    } catch (error) {
      console.error("Ошибка при переводе описания:", error);
      toast("Не удалось перевести описание");
    } finally {
      setIsTranslating(false);
    }
  };

  // Функция для переключения отображения калькулятора
  const toggleCalculator = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCalculator(prev => !prev);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(product)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <div className="relative w-full">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl-md z-10">
              {product.subtitle}
            </div>
          </div>
          
          <ProductImage 
            image={product.image} 
            title={product.title} 
            productId={product.id} 
          />
          
          <div className="w-full text-center">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-base line-clamp-2 flex-1 text-left">{displayedTitle}</h3>
              <Button
                variant="ghost"
                size="icon" 
                className="h-6 w-6 ml-1 flex-shrink-0"
                onClick={handleTranslate}
                disabled={isTranslating}
              >
                <Languages size={16} />
              </Button>
            </div>
            <div className="text-sm mb-2 flex items-center justify-center">
              <span className="mr-1 text-xs">{product.source}</span>
              <div className="flex items-center">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs ml-1">{product.rating}</span>
              </div>
            </div>
            <div className="font-bold text-lg">
              {product.price}
            </div>
            <div className="text-xs text-gray-500">
              {product.availability}
            </div>
            
            {/* Добавляем кнопку для перевода описания с Popover */}
            {product.description && (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs mt-2 w-full py-1 h-auto flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTranslateDescription();
                    }}
                  >
                    {isTranslating ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Languages size={14} />
                    )}
                    <span>{isDescriptionTranslated ? "Оригинальное описание" : "Перевести описание"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3 text-sm">
                  <div className="font-semibold mb-1">
                    {isDescriptionTranslated ? "Переведенное описание" : "Описание товара"}
                  </div>
                  <p className="text-xs">
                    {isDescriptionTranslated ? translatedDescription : product.description}
                  </p>
                </PopoverContent>
              </Popover>
            )}
            
            {/* Кнопка для переключения калькулятора */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs mt-1 w-full py-1 h-auto"
              onClick={toggleCalculator}
            >
              {showCalculator ? "Скрыть расчет" : "Расчет стоимости"}
            </Button>
            
            {/* Калькулятор стоимости */}
            {showCalculator && (
              <MiniCostCalculator product={product} />
            )}
          </div>
          
          <div className="flex w-full mt-3 gap-2">
            {!isSelected ? (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(product);
                }}
              >
                Выбрать
              </Button>
            ) : (
              <Button 
                variant="default"
                className="flex-1"
                disabled
              >
                Выбрано
              </Button>
            )}
            
            <ProductDetailsDialog product={product} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
