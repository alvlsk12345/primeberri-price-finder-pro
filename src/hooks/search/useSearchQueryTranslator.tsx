
import { containsCyrillicCharacters, translateToEnglish } from "@/services/translationService";
import { toast } from "sonner";

export function useSearchQueryTranslator() {
  
  // Функция для перевода поискового запроса
  const translateQueryIfNeeded = async (query: string): Promise<{
    translatedQuery: string,
    wasTranslated: boolean
  }> => {
    let translatedQuery = query;
    let wasTranslated = false;
    
    if (containsCyrillicCharacters(query)) {
      console.log("Обнаружен запрос на русском языке. Выполняем перевод...");
      try {
        translatedQuery = await translateToEnglish(query);
        console.log(`Запрос "${query}" переведен как "${translatedQuery}"`);
        wasTranslated = true;
        
        // Уведомляем пользователя о переводе
        if (translatedQuery && translatedQuery !== query) {
          toast.info(`Запрос переведен для поиска: ${translatedQuery}`, { duration: 3000 });
        }
      } catch (translateError) {
        console.error("Ошибка при переводе запроса:", translateError);
        // Продолжаем с оригинальным запросом
        translatedQuery = query;
      }
    }
    
    return {
      translatedQuery,
      wasTranslated
    };
  };
  
  return {
    translateQueryIfNeeded
  };
}
