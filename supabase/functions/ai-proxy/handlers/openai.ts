
import { OpenAIApi } from "https://esm.sh/openai@4.24.1";
import { Brand } from "../types.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Настройка клиента OpenAI
const openai = new OpenAIApi({
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

// Функция для получения предложений брендов
const getBrandSuggestions = async (
  description: string,
  count: number = 3
): Promise<Brand[]> => {
  try {
    // Формируем системный промт
    const systemPrompt = `Ты - эксперт по товарам. Пользователь опишет, что ищет, а ты предложишь конкретные товары.
Ответ должен содержать только JSON-массив products с объектами, содержащими поля:
1. brand - название бренда
2. product - название модели или товара
3. description - краткое описание товара на русском языке (1-2 предложения)

Формат: {"products": [{"brand": "...", "product": "...", "description": "..."}]}`;

    // Формируем запрос к OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    // Получаем текст ответа
    const content = response.choices[0].message.content;
    console.log("OpenAI response content:", content);

    if (!content) {
      throw new Error("Пустой ответ от OpenAI");
    }

    // Парсим JSON
    try {
      const data = JSON.parse(content);
      
      // Проверяем, есть ли массив products в ответе
      if (data && data.products && Array.isArray(data.products)) {
        return data.products;
      } else {
        console.error("Некорректный формат ответа от OpenAI:", data);
        return [];
      }
    } catch (error) {
      console.error("Ошибка при парсинге JSON:", error);
      throw new Error("Не удалось обработать ответ от OpenAI");
    }
  } catch (error) {
    console.error("Ошибка при получении предложений брендов:", error);
    throw error;
  }
};
