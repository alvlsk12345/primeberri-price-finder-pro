
import { toast } from "sonner";
import { getApiKey } from "./config";
import { getCorsProxyUrl } from "@/services/image/corsProxyService";

// Базовая функция для использования OpenAI API с обработкой ошибок
export const callOpenAI = async (prompt: string, options: {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  responseFormat?: "json_object" | "text";
} = {}): Promise<any> => {
  try {
    // Получаем API ключ из localStorage
    const apiKey = getApiKey();
    
    // Проверка на корректность ключа API
    if (!apiKey) {
      toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    console.log('Отправляем запрос к OpenAI через прокси...');
    
    const defaultOptions = {
      model: "gpt-4o",
      temperature: 0.2,
      max_tokens: 500,
      responseFormat: "text"
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    // Формируем тело запроса
    const requestBody: any = {
      model: finalOptions.model,
      temperature: finalOptions.temperature,
      max_tokens: finalOptions.max_tokens,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };
    
    // Добавляем формат ответа, если задан JSON
    if (finalOptions.responseFormat === "json_object") {
      requestBody.response_format = { type: "json_object" };
    }

    // Используем CORS прокси для обхода ограничений
    const originalApiUrl = 'https://api.openai.com/v1/chat/completions';
    const proxyUrl = getCorsProxyUrl(originalApiUrl);

    // Выполняем запрос к API OpenAI через CORS прокси
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Original-Authorization': `Bearer ${apiKey}`, // Передаем API ключ в специальном заголовке для прокси
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || 'Неизвестная ошибка';
      
      console.error('Ошибка от API OpenAI:', errorMessage);
      
      // Проверяем специфические ошибки и даем понятные сообщения
      if (errorMessage.includes("quota")) {
        toast.error("Превышен лимит запросов API. Проверьте ваш тарифный план OpenAI.");
        throw new Error("Превышен лимит запросов OpenAI API");
      } else if (errorMessage.includes("invalid")) {
        toast.error("Недействительный API ключ. Пожалуйста, проверьте его в настройках.");
        throw new Error("Недействительный API ключ");
      } else {
        toast.error(`Ошибка API: ${errorMessage}`);
        throw new Error(`Ошибка OpenAI API: ${errorMessage}`);
      }
    }

    const data = await response.json();
    console.log('Получен ответ от OpenAI:', data);
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Пустой ответ от API');
    }

    // Обработка ответа в зависимости от запрошенного формата
    if (finalOptions.responseFormat === "json_object") {
      try {
        // Если ответ - это уже объект, просто возвращаем его
        if (typeof content === 'object') {
          return content;
        }
        
        // Удаляем markdown символы, если они есть
        const cleanedContent = content
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        // Парсим JSON
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('Ошибка при парсинге JSON ответа:', parseError);
        // Возвращаем сырой контент для дальнейшей обработки
        return content;
      }
    } else {
      // Для текстового формата просто возвращаем контент
      return content;
    }

  } catch (error) {
    console.error('Ошибка при запросе к OpenAI:', error);
    throw error;
  }
};

// Специфичная функция для общего использования OpenAI API
export const fetchFromOpenAI = async (query: string): Promise<any> => {
  // Улучшенный промпт для обработки сложных запросов
  const promptTemplate = `
Ты — AI-ассистент для поиска товаров в интернете (Zalando, Amazon, Ozon, Wildberries и другие магазины). На основе пользовательского запроса сгенерируй список из 3 карточек товаров в формате JSON.

ВАЖНО: Твой ответ должен быть МАССИВОМ из 3 объектов товаров в формате JSON. Даже если найден только один товар, верни его как массив из одного элемента.

Для каждого товара укажи:
- "title": Название товара,
- "subtitle": Краткое описание (1 слово, например: "Классика", "Новинка", "Хит"),
- "price": Цена с валютой (например: "101,95 €" или "85.99 $"),
- "image": Прямая ссылка на изображение товара,
- "link": Ссылка на карточку товара в магазине,
- "rating": Оценка по 5-балльной шкале (например: 4.8),
- "source": Название магазина (например: "Zalando.nl" или "Amazon.com")

ОЧЕНЬ ВАЖНО:
- Внимательно анализируй запрос пользователя: учитывай указанный пол, цвет, категорию товара, диапазон цен.
- Если указан ценовой диапазон, подбирай товары в указанном диапазоне цен.
- Изображение обязательно должно соответствовать товару и всем параметрам запроса.
- Все ссылки на изображения должны быть прямыми и вести на картинки формата jpg, png, webp.
- Отвечай ТОЛЬКО в формате массива JSON без пояснений и комментариев.
- Не придумывай данные. Показывай только реальные товары, которые можно найти в интернете.
- Если товары не найдены — верни пустой массив: []
- ВАЖНО: Твой ответ не должен содержать обрамляющие символы markdown или обозначения формата (\`\`\`json, \`\`\`, или любые другие форматирующие символы). Верни только массив JSON.
- ВСЕГДА возвращай результат как массив объектов, даже если найден только один товар.

Пользовательский запрос: "${query}"
`;

  return callOpenAI(promptTemplate, {
    responseFormat: "json_object",
    temperature: 0.2,
    max_tokens: 1000
  });
};
