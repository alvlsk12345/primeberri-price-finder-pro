
import { toast } from "sonner";
import { getApiKey } from "./config";
import { 
  getCorsProxyUrl, 
  switchToNextProxy, 
  getCurrentProxyName,
  getMaxProxyAttempts
} from "@/services/image/corsProxyService";

// Максимальное количество попыток запроса с разными прокси
const MAX_RETRY_ATTEMPTS = getMaxProxyAttempts();

// Базовая функция для использования OpenAI API с обработкой ошибок и автоматическим переключением прокси
export const callOpenAI = async (prompt: string, options: {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  responseFormat?: "json_object" | "text";
  retryAttempt?: number; // Счетчик попыток
} = {}): Promise<any> => {
  try {
    // Инициализируем счетчик попыток, если он не был передан
    const retryAttempt = options.retryAttempt || 0;
    
    // Если исчерпаны все попытки с разными прокси, показываем ошибку
    if (retryAttempt >= MAX_RETRY_ATTEMPTS) {
      toast.error(`Не удалось подключиться ни к одному из доступных CORS прокси. Попробуйте позже.`, { duration: 5000 });
      throw new Error("Исчерпаны все попытки подключения к CORS прокси");
    }
    
    // Получаем API ключ из localStorage
    const apiKey = getApiKey();
    
    // Проверка на корректность ключа API
    if (!apiKey) {
      toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    console.log(`Отправляем запрос к OpenAI через прокси ${getCurrentProxyName()} (попытка ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS})...`);
    
    const defaultOptions = {
      model: "gpt-4o",
      temperature: 0.2,
      max_tokens: 500,
      responseFormat: "text" as "json_object" | "text"
    };
    
    const finalOptions = { ...defaultOptions, ...options, retryAttempt };
    
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

    // Вводим таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд

    // Выполняем запрос к API OpenAI через CORS прокси
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Original-Authorization': `Bearer ${apiKey}`, // Передаем API ключ в специальном заголовке для прокси
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    // Очищаем таймаут
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Не удалось прочитать ответ" } }));
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
        // Переключаемся на другой прокси и пытаемся снова
        switchToNextProxy();
        return callOpenAI(prompt, {
          ...finalOptions,
          retryAttempt: retryAttempt + 1
        });
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

  } catch (error: any) {
    console.error('Ошибка при запросе к OpenAI:', error);
    
    // Обработка ошибок сети - переключаем прокси и повторяем запрос
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn(`Ошибка соединения с прокси ${getCurrentProxyName()}, пробуем следующий...`);
      
      // Переключаемся на следующий прокси
      switchToNextProxy();
      
      // Получаем текущий номер попытки
      const retryAttempt = options.retryAttempt || 0;
      
      // Если не исчерпаны попытки, пробуем снова
      if (retryAttempt < MAX_RETRY_ATTEMPTS - 1) {
        return callOpenAI(prompt, {
          ...options,
          retryAttempt: retryAttempt + 1
        });
      } else {
        toast.error("Не удалось подключиться к API. Возможная причина - ограничение CORS или проблема с сетью.", { duration: 5000 });
      }
    } else if (error.name === 'AbortError') {
      console.warn('Запрос был отменен из-за таймаута');
      toast.error("Превышено время ожидания ответа от сервера. Проверьте подключение к интернету.", { duration: 3000 });
      
      // Переключаемся на следующий прокси и пытаемся снова
      switchToNextProxy();
      
      // Получаем текущий номер попытки
      const retryAttempt = options.retryAttempt || 0;
      
      // Если не исчерпаны попытки, пробуем снова
      if (retryAttempt < MAX_RETRY_ATTEMPTS - 1) {
        return callOpenAI(prompt, {
          ...options,
          retryAttempt: retryAttempt + 1
        });
      }
    }
    
    throw error;
  }
};

// Специфичная функция для общего использования OpenAI API
export const fetchFromOpenAI = async (query: string): Promise<any> => {
  try {
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
  } catch (error) {
    console.error('Ошибка при запросе к OpenAI:', error);
    
    // Возвращаем демо-данные в случае ошибки
    toast.warning("Не удалось получить данные от OpenAI API. Используем демо-данные.", { duration: 3000 });
    
    // Создаем шаблонные товары на основе запроса
    return createMockProductsFromQuery(query);
  }
};

// Функция для создания имитационных данных о товарах на основе запроса
function createMockProductsFromQuery(query: string): any[] {
  const normalizedQuery = query.toLowerCase();
  
  // Базовые демо-данные о товарах
  const mockProducts = [
    {
      title: `${normalizedQuery.charAt(0).toUpperCase() + normalizedQuery.slice(1)} Premium`,
      subtitle: "Новинка",
      price: "99.95 €",
      image: "https://placehold.co/600x400?text=Product+Image",
      link: "https://example.com/product1",
      rating: 4.8,
      source: "Demo Shop"
    },
    {
      title: `${normalizedQuery.charAt(0).toUpperCase() + normalizedQuery.slice(1)} Classic`,
      subtitle: "Хит",
      price: "79.99 €",
      image: "https://placehold.co/600x400?text=Product+Image",
      link: "https://example.com/product2",
      rating: 4.5,
      source: "Demo Shop"
    },
    {
      title: `${normalizedQuery.charAt(0).toUpperCase() + normalizedQuery.slice(1)} Budget`,
      subtitle: "Выгода",
      price: "49.99 €",
      image: "https://placehold.co/600x400?text=Product+Image",
      link: "https://example.com/product3",
      rating: 4.2,
      source: "Demo Shop"
    }
  ];
  
  return mockProducts;
}
