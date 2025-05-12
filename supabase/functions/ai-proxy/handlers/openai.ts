
import { CORS_HEADERS } from '../config.ts';

// Ключ для доступа к OpenAI API
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Настройки OpenAI API
const OPENAI_API_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini'; // Используем более быстрый и экономичный gpt-4o-mini
const DEFAULT_TEMPERATURE = 0.2; // Снижаем температуру для более предсказуемых ответов
const DEFAULT_MAX_TOKENS = 800; // Уменьшаем max_tokens для более быстрого ответа

/**
 * Генерирует предложения брендов на основе описания продукта
 * @param description Описание продукта
 * @param count Количество предложений для генерации
 * @returns Массив предложений брендов
 */
export const generateBrandSuggestions = async (description: string, count: number = 6) => {
  console.log(`Запрос к OpenAI с описанием: ${description}`);

  // Оптимизированный промпт для более быстрого и точного ответа
  const prompt = `
Ты - помощник по поиску товаров в интернет-магазинах. На основе описания товара предложи ${count} конкретных товаров с указанием: бренда, названия, типа, подтипа и цвета.

ВАЖНО: Возвращай строго массив с ${count} объектами с такой структурой:
[
  {
    "brand": "Название бренда",
    "product": "Название модели",
    "description": "Краткое описание",
    "type": "Тип товара",
    "subtype": "Подтип товара", 
    "color": "Цвет товара"
  },
  ...
]

ПРАВИЛА:
- Возвращай только JSON-массив, без дополнительных комментариев
- Описание товара должно быть максимально конкретным
- Если описание указывает на определенный бренд, обязательно включи его
- Включай реальные модели товаров, не выдумывай
- Если пользователь явно указал параметры (цвет, размер и т.д.), обязательно учитывай их

Описание товара: "${description}"`;

  try {
    // Более быстрый запрос с меньшим количеством токенов
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт в области онлайн-шоппинга. Отвечай только в формате JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    console.log(`OpenAI ответ получен, длина: ${data.choices?.[0]?.message?.content?.length || 0}`);

    if (!response.ok) {
      throw new Error(`OpenAI вернул ошибку: ${data.error?.message || JSON.stringify(data)}`);
    }

    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Пустой ответ от OpenAI API');
    }

    let suggestions;
    try {
      suggestions = JSON.parse(content);
      
      if (Array.isArray(suggestions)) {
        console.log(`Успешно получен массив products: ${suggestions.length}`);
        return suggestions;
      } else if (suggestions.products && Array.isArray(suggestions.products)) {
        console.log(`Успешно получен массив products: ${suggestions.products.length}`);
        return suggestions.products;
      } else {
        throw new Error('Ответ не содержит ожидаемого массива');
      }
    } catch (jsonError) {
      console.error('Ошибка при парсинге JSON из ответа OpenAI:', jsonError);
      console.error('Содержимое ответа:', content);
      throw new Error('Невалидный JSON в ответе OpenAI');
    }
  } catch (error) {
    console.error('Ошибка при запросе к OpenAI:', error);
    throw error;
  }
};

/**
 * Обработчик запросов к OpenAI
 * @param params Параметры запроса
 * @returns Результат запроса
 */
export const handleOpenAIRequest = async (params: any) => {
  if (!OPENAI_API_KEY) {
    return { error: 'OpenAI API ключ не настроен' };
  }

  try {
    const { action, ...actionParams } = params;

    if (action === 'getBrandSuggestions') {
      console.log('Обработка OpenAI запроса: getBrandSuggestions', params);
      
      const { description, count = 6 } = actionParams;
      
      if (!description) {
        return { error: 'Не указано описание товара' };
      }
      
      const suggestions = await generateBrandSuggestions(description, count);
      return { suggestions };
    } else {
      return { error: `Неизвестное действие: ${action}` };
    }
  } catch (error) {
    console.error('Ошибка при обработке OpenAI запроса:', error);
    return { error: error.message || 'Неизвестная ошибка' };
  }
};
