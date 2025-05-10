
import { toast } from "sonner";
import { BrandSuggestion } from "@/services/types";
import { getPlaceholderImageUrl } from "@/services/imageService";
import { searchProductImageGoogle } from "@/services/api/googleSearchService";
import { callAbacusApi } from "./apiClient";
import { getApiKey, hasValidApiKey } from "./config";

// Тип для ответа от API брендов
type AbacusBrandResponse = {
  suggestions: AbacusBrandSuggestion[];
};

// Тип для предложения бренда от API
type AbacusBrandSuggestion = {
  brand: string;
  product: string;
  description: string;
  image_url?: string;
};

/**
 * Функция для получения предложений брендов через Abacus AI
 * @param description Описание продукта для поиска брендов
 * @returns Массив предложений брендов
 */
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Проверка наличия API ключа
    if (!hasValidApiKey()) {
      toast.error("API ключ Abacus не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    console.log('Отправляем запрос к Abacus AI для получения брендов...');
    
    // Выполняем запрос к API
    // Предположим, что у Abacus есть метод getBrandSuggestions
    const result = await callAbacusApi<AbacusBrandResponse>('getBrandSuggestions', 'POST', {
      query: description,
      limit: 3
    });
    
    // Проверяем наличие результатов
    if (!result || !result.suggestions || result.suggestions.length === 0) {
      console.log('Abacus не вернул предложений брендов');
      return [];
    }
    
    // Преобразуем предложения брендов в формат нашего приложения
    const suggestions: BrandSuggestion[] = [];
    
    for (let i = 0; i < result.suggestions.length; i++) {
      const suggestion = result.suggestions[i];
      
      // Если нет изображения, ищем его через Google CSE
      let imageUrl = suggestion.image_url || '';
      if (!imageUrl) {
        console.log(`Поиск изображения для ${suggestion.brand} ${suggestion.product} через Google CSE`);
        imageUrl = await searchProductImageGoogle(
          `${suggestion.brand} ${suggestion.product}`, 
          String(i) // Исправление: передаем число как строку
        );
      }
      
      suggestions.push({
        brand: suggestion.brand,
        product: suggestion.product,
        description: suggestion.description,
        imageUrl: imageUrl || getPlaceholderImageUrl(suggestion.brand)
      });
    }
    
    return suggestions.slice(0, 3);
  } catch (error) {
    console.error('Ошибка при запросе к Abacus для брендов:', error);
    throw error;
  }
};
