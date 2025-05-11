
import { OpenAI } from "https://esm.sh/openai@4.24.1";
import { Brand, BrandResponse } from "../types.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Настройка клиента OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Обработчик запросов к OpenAI API
export const handleOpenAIRequest = async (
  params: {
    action: string;
    prompt?: string;
    description?: string;
    count?: number;
    options?: any;
  }
): Promise<any> => {
  console.log(`Обработка OpenAI запроса: ${params.action}`, params);
  
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY не установлен в переменных окружения");
  }

  switch (params.action) {
    case "getBrandSuggestions":
      return await getBrandSuggestions(params.description || "", params.count || 3);
    default:
      throw new Error(`Неизвестное действие: ${params.action}`);
  }
};

// Функция для получения предложений брендов, всегда возвращает массив BrandSuggestion
const getBrandSuggestions = async (
  description: string,
  count: number = 3
): Promise<Brand[]> => {
  try {
    // Формируем системный промпт с более четкими инструкциями
    const systemPrompt = `Ты - эксперт по электронным товарам и аксессуарам для мобильных устройств.
Твоя задача - предложить конкретные товары на основе описания пользователя.
Ответ ДОЛЖЕН содержать ТОЛЬКО JSON-массив products с объектами, где каждый объект имеет:
1. brand - название бренда (строка)
2. product - название модели или товара (строка)
3. description - краткое описание товара на русском языке (1-2 предложения)

Формат: {"products": [{"brand": "...", "product": "...", "description": "..."}]}

Всегда возвращай точно 5 результатов. Не нумеруй результаты.`;

    console.log('Запрос к OpenAI с описанием:', description);
    
    // Добавляем таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Формируем запрос к OpenAI с моделью gpt-4o как указано
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Используем модель gpt-4o вместо gpt-4o-mini
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: description,
          },
        ],
        temperature: 0.7,
        max_tokens: 500, // Уменьшаем количество токенов для ускорения ответа
        response_format: { type: "json_object" }
      });

      // Очищаем таймаут
      clearTimeout(timeoutId);

      // Получаем текст ответа
      const content = response.choices[0].message.content;
      console.log("OpenAI ответ получен, длина:", content?.length || 0);

      if (!content) {
        console.error("Пустой ответ от OpenAI");
        return [];
      }

      // Парсим JSON
      try {
        const data = JSON.parse(content) as BrandResponse;
        
        // Проверяем, есть ли массив products в ответе
        if (data && data.products && Array.isArray(data.products)) {
          console.log("Успешно получен массив products:", data.products.length);
          return data.products; // Возвращаем массив products
        } else {
          console.error("Некорректный формат ответа от OpenAI:", data);
          return [];
        }
      } catch (error) {
        console.error("Ошибка при парсинге JSON:", error);
        return [];
      }
    } catch (error) {
      // Отменяем таймаут при ошибке
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Ошибка при получении предложений брендов:", error);
    return [];
  }
};
