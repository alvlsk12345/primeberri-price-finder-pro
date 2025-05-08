
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

    // Создаем запрос к OpenAI API для генерации результатов поиска
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",  // Используем более доступную модель
        messages: [
          {
            role: "system",
            content: "Ты - помощник для поиска товаров. Генерируй релевантные результаты поиска в формате JSON на основе запроса пользователя. Результаты должны включать 3-5 товаров с названием, ценой в евро, магазином и ссылкой на реальное изображение товара."
          },
          {
            role: "user",
            content: `Найди товары по запросу: ${query}. Верни только JSON без дополнительного текста, в формате: [{"id": "уникальный_id", "name": "название товара", "price": цена_в_числовом_формате, "currency": "EUR", "image": "ссылка_на_изображение", "store": "название_магазина"}]. Для изображений используй публичные URL изображений товаров.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
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
    return data.choices[0]?.message?.content;

  } catch (error) {
    console.error('Ошибка при запросе к OpenAI:', error);
    throw error;
  }
};
