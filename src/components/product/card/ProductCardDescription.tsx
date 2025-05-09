
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";
import { translateText } from "@/services/translationService";
import { toast } from "sonner";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";

interface ProductCardDescriptionProps {
  description?: string;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ProductCardDescription: React.FC<ProductCardDescriptionProps> = ({ 
  description,
  onStopPropagation
}) => {
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedDescription, setTranslatedDescription] = useState<string>("");
  const [isDescriptionTranslated, setIsDescriptionTranslated] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  // Function to translate product description
  const handleTranslateDescription = async (e: React.MouseEvent) => {
    onStopPropagation(e);
    
    if (!description) {
      toast("Нет описания для перевода");
      return;
    }
    
    try {
      setIsTranslating(true);
      setIsPopoverOpen(true);
      
      // If we already have a translated description, just toggle the flag
      if (isDescriptionTranslated && translatedDescription) {
        setIsDescriptionTranslated(false);
        toast("Отображено оригинальное описание");
      } else {
        // Perform translation
        const sourceLanguage = "en";
        const targetLanguage = "ru";
        
        const translated = await translateText(
          description,
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

  if (!description) {
    return null;
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs mt-2 w-full py-1 h-auto flex items-center justify-center gap-1"
          onClick={handleTranslateDescription}
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
          {isDescriptionTranslated ? translatedDescription : description}
        </p>
      </PopoverContent>
    </Popover>
  );
};
