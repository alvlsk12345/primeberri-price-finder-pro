
import React, { useState, useEffect } from 'react';
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translateText, containsRussian } from "@/services/translationService";
import { toast } from "sonner";

interface ProductDetailsDescriptionProps {
  description: string | undefined;
  isOpen: boolean;
}

export const ProductDetailsDescription: React.FC<ProductDetailsDescriptionProps> = ({ 
  description,
  isOpen 
}) => {
  // Состояние для отслеживания загрузки описания и процесса перевода
  const [isDescriptionLoaded, setIsDescriptionLoaded] = useState<boolean>(true);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  
  // Состояние для хранения оригинального и переведенного описания
  const [originalDescription, setOriginalDescription] = useState<string>(description || "");
  const [translatedDescription, setTranslatedDescription] = useState<string>(description || "");
  
  // Состояние для отслеживания, переведено ли описание
  const [isTranslated, setIsTranslated] = useState<boolean>(false);

  // При открытии диалога сбрасываем состояния и устанавливаем оригинальное описание
  useEffect(() => {
    if (isOpen) {
      setIsDescriptionLoaded(true);
      setOriginalDescription(description || "");
      setTranslatedDescription(description || "");
      setIsTranslated(description ? containsRussian(description) : false);
    }
  }, [isOpen, description]);

  // Функция для перевода описания
  const handleTranslate = async () => {
    try {
      // Если описание отсутствует или уже переведено, не выполняем перевод
      if (!originalDescription || isTranslated) {
        return;
      }

      setIsTranslating(true);
      
      // Определяем направление перевода (с английского на русский или наоборот)
      const sourceLanguage = containsRussian(translatedDescription) ? "ru" : "en";
      const targetLanguage = sourceLanguage === "ru" ? "en" : "ru";
      
      // Выполняем перевод
      const translated = await translateText(
        translatedDescription, 
        sourceLanguage, 
        targetLanguage
      );
      
      // Обновляем состояние с переведенным текстом
      setTranslatedDescription(translated);
      setIsTranslated(targetLanguage === "ru");
      
      // Показываем уведомление об успешном переводе
      toast.success(`Описание переведено на ${targetLanguage === "ru" ? "русский" : "английский"} язык`);
    } catch (error) {
      console.error("Ошибка при переводе описания:", error);
      toast.error("Не удалось перевести описание");
    } finally {
      setIsTranslating(false);
    }
  };

  // Функция для переключения между оригинальным и переведенным текстом
  const toggleTranslation = () => {
    if (isTranslated) {
      // Если уже переведено, возвращаемся к оригиналу
      setIsTranslated(false);
      setTranslatedDescription(originalDescription);
      toast.info("Показан оригинальный текст");
    } else {
      // Если не переведено, запускаем перевод
      handleTranslate();
    }
  };

  if (!translatedDescription) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-semibold">Описание</h4>
        
        <Button 
          variant="outline" 
          size="sm"
          disabled={isTranslating || !originalDescription}
          onClick={toggleTranslation}
          className="flex items-center gap-1"
        >
          {isTranslating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Languages className="h-3 w-3" />
          )}
          <span>
            {isTranslating 
              ? "Перевод..." 
              : isTranslated 
                ? "Показать оригинал" 
                : "Перевести"
            }
          </span>
        </Button>
      </div>
      
      {isDescriptionLoaded ? (
        <p className="text-sm">{translatedDescription}</p>
      ) : (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-gray-500">Загрузка описания...</p>
        </div>
      )}
    </div>
  );
};
