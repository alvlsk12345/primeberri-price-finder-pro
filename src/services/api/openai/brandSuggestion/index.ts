
import { toast } from "sonner";
import { BrandSuggestion } from "@/services/types";
import { callOpenAI } from "../apiClient";
import { getApiKey } from "../config";
import { createMockBrandSuggestions } from "./mockGenerators";
import { parseBrandApiResponse } from "./responseParser";
import { generateBrandSuggestionPrompt } from "./promptUtils";

// Основная функция получения предложений брендов
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Проверка наличия API ключа
    const apiKey = getApiKey();
    
    if (!apiKey) {
      toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    console.log('Отправляем запрос к OpenAI для получения брендов...');
    
    // Генерируем промпт для API
    const brandPrompt = generateBrandSuggestionPrompt(description);
    
    // Получаем ответ от API с оптимизированными параметрами для лучшего качества
    console.log('Отправляем промпт к OpenAI:', brandPrompt);
    
    // Используем температуру ближе к 0 для более точных ответов
    const content = await callOpenAI(brandPrompt, {
      temperature: 0.3,
      max_tokens: 350,
      model: "gpt-4o" // Изменено на gpt-4o
    });

    // Парсим ответ от API
    const suggestions = await parseBrandApiResponse(content);

    // Если не удалось получить хотя бы одно предложение, создаем демо-данные
    if (suggestions.length === 0) {
      console.warn('Не удалось получить корректные предложения от OpenAI, создаем демо-данные');
      toast.warning("Не удалось получить реальные данные о брендах. Показываем примеры.", { duration: 4000 });
      return createMockBrandSuggestions(description);
    }

    // Если получили меньше 3 предложений, дополняем их моками чтобы сохранить консистентность UI
    if (suggestions.length < 3) {
      console.warn(`Получено только ${suggestions.length} предложений. Дополняем моками до 3`);
      const mocks = createMockBrandSuggestions(description);
      for (let i = suggestions.length; i < 3; i++) {
        suggestions.push(mocks[i % mocks.length]);
      }
    }

    console.log(`Возвращаем ${suggestions.length} предложений брендов:`, suggestions);
    return suggestions.slice(0, 3); // Ограничиваем 3 результатами

  } catch (error) {
    console.error('Ошибка при запросе к OpenAI для брендов:', error);
    
    // Показываем пользователю информацию о проблеме и что используем демо-данные
    toast.error(`Ошибка при получении брендов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, { 
      duration: 4000,
      description: "Используем демонстрационные данные"
    });
    
    // В случае любой ошибки возвращаем демо-данные
    return createMockBrandSuggestions(description);
  }
};

// Реэкспорт функции создания моков для использования в других модулях
export { createMockBrandSuggestions } from "./mockGenerators";
