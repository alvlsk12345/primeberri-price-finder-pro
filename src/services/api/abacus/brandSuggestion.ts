
import { BrandSuggestion } from "@/services/types";
import { callPerplexityAI } from "./apiClient";
import { toast } from "sonner";

/**
 * Функция для получения предложений по брендам через Perplexity API
 * @param description Описание запроса
 * @returns Массив предложений брендов
 */
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Системный промпт для формата JSON
    const systemPrompt = `Ты - эксперт по электронным товарам и аксессуарам для мобильных устройств.
Твоя задача - предложить конкретные товары на основе описания пользователя. Ищи товары только в странах европейского союза.
Ответ ДОЛЖЕН содержать ТОЛЬКО JSON-массив products с объектами, где каждый объект имеет:
1. brand - название бренда (строка)
2. product - название модели или товара (строка)
3. description - краткое описание товара на русском языке (1-2 предложения)

Формат: {"products": [{"brand": "...", "product": "...", "description": "..."}]}

Всегда возвращай точно 6 результатов. Не нумеруй результаты.`;
    
    console.log('Отправляем запрос к Perplexity API для получения предложений брендов');

    // Формируем данные для запроса
    const requestData = {
      model: "sonar", // Используем модель sonar
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: description }
      ],
      temperature: 0.1,  // Оставляем температуру 0.1
      max_tokens: 500    // Увеличиваем с 300 до 500 токенов
      // Параметр response_format удален, так как он вызывает ошибку
    };
    
    // Вызываем API для получения брендов
    const result = await callPerplexityAI('getBrandSuggestions', 'POST', requestData);
    
    // Извлекаем содержимое ответа
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      console.warn('Пустой ответ от Perplexity API');
      return [];
    }
    
    // Пытаемся распарсить ответ как JSON
    try {
      const data = JSON.parse(content);
      
      if (data && data.products && Array.isArray(data.products)) {
        console.log("Успешно получен массив products от Perplexity:", data.products.length);
        return data.products as BrandSuggestion[];
      } else {
        console.error("Некорректный формат JSON от Perplexity или отсутствует массив 'products':", data);
        return [];
      }
    } catch (parseError) {
      console.error('Ошибка при парсинге ответа от Perplexity API:', parseError);
      console.log('Сырой ответ от API:', content);
      return [];
    }
  } catch (error) {
    console.error('Ошибка при запросе к Perplexity API для получения брендов:', error);
    toast.error('Ошибка при получении предложений брендов через Perplexity API', { duration: 3000 });
    return [];
  }
};
