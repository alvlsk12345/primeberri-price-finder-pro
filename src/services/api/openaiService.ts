
import { toast } from "@/components/ui/sonner";
import { BrandSuggestion } from "@/services/types";
import { processProductImage } from "@/services/imageProcessor";

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

    console.log('Отправляем запрос к OpenAI...');
    
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

    const data = await openaiResponse.json();
    console.log('Получен ответ от OpenAI:', data);
    
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

// Новая функция для получения предложений брендов
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Получаем API ключ из localStorage
    const apiKey = getApiKey();
    
    // Проверка на корректность ключа API
    if (!apiKey) {
      toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    console.log('Отправляем запрос к OpenAI для получения брендов...');
    
    // Специализированный промпт для получения брендов с изображениями
    const brandPrompt = `Помощник для поиска брендов и товаров: Когда пользователь вводит описание товара или запроса, система должна предложить 5 вариантов брендов и соответствующих товаров, которые могут соответствовать запросу. Для каждого бренда вывести его название, название товара, краткое описание товара и URL изображения товара на русском языке. Ответ должен содержать список из 5 брендов с их товарами, названиями товаров, короткими описаниями и ссылками на изображения. Формат: 'Бренд: [название бренда], Товар: [название товара], Описание: [краткое описание товара], Изображение: [URL изображения товара]'.

Запрос пользователя: "${description}"`;

    // API запрос к OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.5,
        max_tokens: 600, // Увеличим лимит токенов для включения URL изображений
        messages: [
          {
            role: "user",
            content: brandPrompt
          }
        ]
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      const errorMessage = errorData.error?.message || 'Неизвестная ошибка';
      
      console.error('Ошибка от API OpenAI при получении брендов:', errorMessage);
      
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
    console.log('Получен ответ от OpenAI для брендов:', data);
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Пустой ответ от API');
    }

    // Парсинг ответа в формате "Бренд: X, Товар: Y, Описание: Z, Изображение: URL"
    const suggestions: BrandSuggestion[] = [];
    
    // Разделяем ответ на строки и извлекаем данные
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    for (const line of lines) {
      try {
        const brandMatch = line.match(/Бренд:\s*([^,]+)/i);
        const productMatch = line.match(/Товар:\s*([^,]+)/i);
        const descriptionMatch = line.match(/Описание:\s*([^,]+)/i);
        const imageMatch = line.match(/Изображение:\s*(.+)/i);
        
        if (brandMatch && productMatch && descriptionMatch) {
          const imageUrl = imageMatch ? imageMatch[1].trim() : undefined;
          
          // Обработка изображения с помощью processProductImage, если URL существует
          const processedImageUrl = imageUrl ? processProductImage(imageUrl, suggestions.length) : undefined;
          
          suggestions.push({
            brand: brandMatch[1].trim(),
            product: productMatch[1].trim(),
            description: descriptionMatch[1].trim(),
            imageUrl: processedImageUrl
          });
        }
      } catch (error) {
        console.error('Ошибка при парсинге строки:', line, error);
      }
    }

    // Если у нас нет 5 результатов, возвращаем то что есть
    return suggestions.slice(0, 5);

  } catch (error) {
    console.error('Ошибка при запросе к OpenAI для брендов:', error);
    throw error;
  }
};
