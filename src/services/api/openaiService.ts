
import { toast } from "@/components/ui/sonner";

// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  return localStorage.getItem('openai_api_key') || '';
};

// Функция для использования OpenAI API
export const fetchFromOpenAI = async (query: string): Promise<any> => {
  try {
    // Получаем API ключ из localStorage
    const apiKey = getApiKey();
    
    // Проверка на корректность ключа API
    if (!apiKey) {
      toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    const promptTemplate = `
Ты — AI-ассистент, помогающий искать реальные товары в интернете (Zalando, Amazon, Ozon, Wildberries и другие магазины). На основе пользовательского запроса сгенерируй список из 3 карточек товаров в формате JSON.

Для каждого товара укажи:
- "title": Название товара,
- "subtitle": Краткое описание (1 слово, например: "Классика", "Новинка", "Хит"),
- "price": Цена с валютой (например: "101,95 €"),
- "image": Прямая ссылка на изображение товара,
- "link": Ссылка на карточку товара в магазине,
- "rating": Оценка по 5-балльной шкале (например: 4.8),
- "source": Название магазина (например: "Zalando.nl")

ОЧЕНЬ ВАЖНО:
- Изображение обязательно должно соответствовать товару. Проверь, что ссылка на изображение действительно показывает именно тот товар, который указан в названии.
- Изображения должны быть реальными и соответствовать названию товара. Например, если название "Nike кроссовки", то изображение должно быть именно кроссовок Nike.
- Все ссылки на изображения должны быть прямыми и вести на картинки формата jpg, png, webp.
- Отвечай только в JSON без пояснений и комментариев.
- Не придумывай данные. Покажи только реальные товары, которые можно найти в интернете.
- Если товары не найдены — верни пустой массив: []
- ВАЖНО: Твой ответ не должен содержать обрамляющие символы markdown или обозначения формата (\`\`\`json, \`\`\`, или любые другие форматирующие символы). Верни только чистый JSON.

Пользовательский запрос: "${query}"
`;

    // API запрос к OpenAI с обновленным форматом
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: promptTemplate
          }
        ]
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      const errorMessage = errorData.error?.message || 'Неизвестная ошибка';
      
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

    const data = await openaiResponse.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Пустой ответ от API');
    }

    // Попытка обработать ответ, который может содержать маркдаун
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
      
      // Возвращаем сырой контент для дальнейшей обработки в productService
      return content;
    }

  } catch (error) {
    console.error('Ошибка при запросе к OpenAI:', error);
    throw error;
  }
};
