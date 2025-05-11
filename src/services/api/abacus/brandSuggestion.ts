
import { toast } from "sonner";
import { BrandSuggestion } from "@/services/types";
import { generateTextViaAbacus } from "./apiClient";
import { hasValidApiKey } from "./config";
import { createMockBrandSuggestions } from "../openai/brandSuggestion/mockGenerators";
import { parseBrandApiResponse } from "../openai/brandSuggestion/responseParser";

// Функция для генерации промпта для получения брендов
function generateBrandSuggestionPrompt(description: string): string {
  return `Я ищу продукты, соответствующие следующему описанию: "${description}".
Пожалуйста, предложи мне 3 реальных брендов и конкретных продуктов, соответствующих этому описанию.
Для каждого продукта укажи:
1. Название бренда
2. Название продукта
3. Краткое описание продукта (до 150 символов)

Верни ответ в формате JSON-массива:
[
  {
    "brand": "Название бренда 1",
    "product": "Название продукта 1",
    "description": "Описание продукта 1"
  },
  ...
]`;
}

// Основная функция получения предложений брендов через Abacus.ai
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Проверка наличия API ключа
    if (!hasValidApiKey()) {
      toast.error("API ключ Abacus.ai не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    console.log('Отправляем запрос к Abacus.ai для получения брендов...');
    
    // Генерируем промпт для API
    const brandPrompt = generateBrandSuggestionPrompt(description);
    
    // Получаем ответ от API
    console.log('Отправляем промпт к Abacus.ai:', brandPrompt);
    
    // Используем параметры, соответствующие Abacus.ai API
    const content = await generateTextViaAbacus(brandPrompt, {
      temperature: 0.3,
      max_tokens: 350
    });

    // Парсим ответ от API с помощью общей функции парсинга
    const suggestions = await parseBrandApiResponse(content);

    // Если не удалось получить хотя бы одно предложение, создаем демо-данные
    if (suggestions.length === 0) {
      console.warn('Не удалось получить корректные предложения от Abacus.ai, создаем демо-данные');
      toast.warning("Не удалось получить реальные данные о брендах. Показываем примеры.", { duration: 4000 });
      return createMockBrandSuggestions(description);
    }

    // Если получили меньше 3 предложений, дополняем их моками
    if (suggestions.length < 3) {
      console.warn(`Получено только ${suggestions.length} предложений. Дополняем моками до 3`);
      const mocks = createMockBrandSuggestions(description);
      for (let i = suggestions.length; i < 3; i++) {
        suggestions.push(mocks[i % mocks.length]);
      }
    }

    console.log(`Возвращаем ${suggestions.length} предложений брендов от Abacus.ai:`, suggestions);
    return suggestions.slice(0, 3); // Ограничиваем 3 результатами

  } catch (error) {
    console.error('Ошибка при запросе к Abacus.ai для брендов:', error);
    
    // Показываем пользователю информацию о проблеме и что используем демо-данные
    toast.error(`Ошибка при получении брендов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, { 
      duration: 4000,
      description: "Используем демонстрационные данные"
    });
    
    // В случае любой ошибки возвращаем демо-данные
    return createMockBrandSuggestions(description);
  }
};
