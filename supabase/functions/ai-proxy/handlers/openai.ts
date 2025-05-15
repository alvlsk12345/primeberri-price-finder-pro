
import { OpenAI } from "https://esm.sh/openai@4.24.1";
import { Brand, BrandResponse } from "../types.ts";
import { CORS_HEADERS } from "../config.ts";

// Настройка клиента OpenAI
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

export const handleOpenAIRequest = async (
  params: {
    action?: string;
    prompt?: string;
    description?: string;
    count?: number;
    options?: any;
  },
  OPENAI_API_KEY: string
): Promise<Response> => {
  console.log(`Обработка OpenAI запроса:`, params);
  
  // Проверяем наличие API ключа
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY не установлен в переменных окружения" }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }

  // Инициализируем клиента OpenAI
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  try {
    // Проверяем тип запроса
    if (params.action === "getBrandSuggestions") {
      // Запрос на получение предложений брендов
      const brands = await getBrandSuggestions(openai, params.description || "", params.count || 6);
      return new Response(
        JSON.stringify(brands),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    } else if (params.prompt) {
      // Обычный запрос с промптом
      const response = await generateResponse(openai, params.prompt, params.options || {});
      return new Response(
        JSON.stringify(response),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    } else {
      // Неизвестный тип запроса
      return new Response(
        JSON.stringify({ error: "Неизвестное действие или отсутствует промпт" }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 400 }
      );
    }
  } catch (error) {
    console.error("Ошибка при обработке запроса к OpenAI:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Неизвестная ошибка" }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
};

// Функция для генерации ответа от OpenAI
const generateResponse = async (
  openai: OpenAI,
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    responseFormat?: "json_object" | "text";
  }
): Promise<any> => {
  try {
    // Устанавливаем параметры запроса с дефолтными значениями
    const {
      model = "gpt-4o",
      temperature = 0.3,
      max_tokens = 1000,
      responseFormat = "text",
    } = options;

    // Формируем запрос к OpenAI
    const requestParams: any = {
      model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature,
      max_tokens
    };

    // Если нужен JSON формат, добавляем соответствующий параметр
    if (responseFormat === "json_object") {
      requestParams.response_format = { type: "json_object" };
    }

    // Выполняем запрос к OpenAI
    const response = await openai.chat.completions.create(requestParams);

    // Получаем текст ответа
    const content = response.choices[0].message.content;

    // Если запрошен JSON формат, пытаемся распарсить ответ
    if (responseFormat === "json_object" && content) {
      try {
        return JSON.parse(content);
      } catch (error) {
        console.warn("Ошибка парсинга JSON:", error);
        return { result: content };
      }
    }

    // Возвращаем результат как есть
    return { result: content };
  } catch (error) {
    console.error("Ошибка при генерации ответа:", error);
    throw error;
  }
};

// Функция для получения предложений брендов, всегда возвращает массив BrandSuggestion
const getBrandSuggestions = async (
  openai: OpenAI,
  description: string,
  count: number = 6
): Promise<Brand[]> => {
  try {
    // Формируем системный промпт с четкими инструкциями
    const systemPrompt = `Ты - эксперт по электронным товарам и аксессуарам для мобильных устройств.
Твоя задача - предложить конкретные товары на основе описания пользователя.
Ответ ДОЛЖЕН содержать ТОЛЬКО JSON-массив products с объектами, где каждый объект имеет:
1. brand - название бренда (строка)
2. product - название модели или товара (строка)
3. description - краткое описание товара на русском языке (1-2 предложения)

Формат: {"products": [{"brand": "...", "product": "...", "description": "..."}]}

Всегда возвращай точно 6 результатов. Не нумеруй результаты.`;

    console.log('Запрос к OpenAI с описанием:', description);
    
    // Добавляем таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Формируем запрос к OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Используем модель gpt-4o
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
        max_tokens: 500,
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
