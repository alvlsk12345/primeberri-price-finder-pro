
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { translateText } from "@/services/translationService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProductCardTitleProps {
  title: string;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardTitle: React.FC<ProductCardTitleProps> = ({ 
  title,
  onStopPropagation
}) => {
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [displayedTitle, setDisplayedTitle] = useState<string>(title);
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [originalTitle, setOriginalTitle] = useState<string>(title);

  // Function to translate the product title
  const handleTranslate = async (e: React.MouseEvent) => {
    onStopPropagation(e); // Prevent selecting the product when clicking the translate button
    
    try {
      setIsTranslating(true);
      
      // Determine translation direction
      const sourceLanguage = isTranslated ? "ru" : "en";
      const targetLanguage = isTranslated ? "en" : "ru";
      
      // If this is the first translation, save the original text
      if (!isTranslated && originalTitle === title) {
        setOriginalTitle(title);
      }
      
      // If already translated, return to original
      if (isTranslated) {
        setDisplayedTitle(originalTitle);
        setIsTranslated(false);
        toast("Отображен оригинальный текст");
      } else {
        // Perform translation
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

  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-base line-clamp-2 flex-1 text-left">{displayedTitle}</h3>
      <Button
        variant="ghost"
        size="icon" 
        className="h-6 w-6 ml-1 flex-shrink-0"
        onClick={handleTranslate}
        disabled={isTranslating}
      >
        {isTranslating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Languages size={16} />
        )}
      </Button>
    </div>
  );
};
