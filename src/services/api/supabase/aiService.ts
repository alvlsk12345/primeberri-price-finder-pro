import { supabase, isSupabaseConnected } from './client';
import { isUsingSupabaseBackend, isFallbackEnabled } from './config';
import { toast } from "sonner";
import { callOpenAI as directCallOpenAI } from '../openai/apiClient';
import { callAbacusAI as directCallAbacusAI } from '../abacus/apiClient';
import { BrandSuggestion } from '@/services/types';

// Типы для запросов к AI через Supabase
interface AIRequestBase {
  provider: 'openai' | 'abacus';
  endpoint?: string;
  method?: 'GET' | 'POST';
}

interface OpenAIRequest extends AIRequestBase {
  provider: 'openai';
  prompt: string;
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    responseFormat?: "json_object" | "text";
  };
}

interface AbacusRequest extends AIRequestBase {
  provider: 'abacus';
  endpoint: string;
  requestData?: Record<string, any>;
}

type AIRequest = OpenAIRequest | AbacusRequest;

// Основная функция для вызова AI через Supabase Edge Functions
export async function callAIViaSupabase(request: AIRequest): Promise<any> {
  // Проверяем, должны ли мы использовать Supabase и подключен ли он
  if (!isUsingSupabaseBackend() || !await isSupabaseConnected()) {
    // Выполняем прямой вызов API, если не используем Supabase или он недоступен
    return fallbackToDirectCall(request);
  }
  
  try {
    if (!supabase) {
      throw new Error('Клиент Supabase не инициализирован');
    }
    
    console.log(`Вызов AI через Supabase Edge Function: ${request.provider}`);
    
    // Вызываем Edge Function для работы с AI
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: request
    });
    
    if (error) {
      throw new Error(`Ошибка вызова Supabase Edge Function: ${error.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('Ошибка при использовании Supabase для AI:', error);
    toast.error(`Ошибка Supabase AI: ${error.message}`, { duration: 5000 });
    
    // Если включен фоллбэк и произошла ошибка, пробуем прямой вызов
    if (isFallbackEnabled()) {
      console.log('Переключение на прямой вызов API после ошибки Supabase');
      toast.info('Пробуем прямой вызов API...', { duration: 2000 });
      return fallbackToDirectCall(request);
    }
    
    throw error;
  }
}

// Функция для прямого вызова API при недоступности Supabase
async function fallbackToDirectCall(request: AIRequest): Promise<any> {
  if (request.provider === 'openai') {
    // Для OpenAI вызываем напрямую функцию из apiClient
    const { prompt, options } = request as OpenAIRequest;
    return directCallOpenAI(prompt, options || {});
  } else if (request.provider === 'abacus') {
    // Для Abacus вызываем напрямую функцию из apiClient
    const { endpoint, method = 'POST', requestData = {} } = request as AbacusRequest;
    return directCallAbacusAI(endpoint, method, requestData);
  }
  
  throw new Error(`Неподдерживаемый провайдер AI: ${(request as any).provider}`);
}

// Специальная функция для поиска через OpenAI
export async function searchViaOpenAI(query: string, options?: any): Promise<any> {
  return callAIViaSupabase({
    provider: 'openai',
    prompt: `
Ты — AI-ассистент для поиска товаров в интернете (Zalando, Amazon, Ozon, Wildberries и друг��е магазины). На основе пользовательского запроса сгенерируй список из 3 карточек товаров в формате JSON.

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
`,
    options: {
      responseFormat: "json_object",
      temperature: 0.2,
      max_tokens: 1000
    }
  });
}

// Функция для получения предложений брендов через OpenAI
export async function fetchBrandSuggestionsViaOpenAI(description: string): Promise<BrandSuggestion[]> {
  const result = await callAIViaSupabase({
    provider: 'openai',
    prompt: `Ты эксперт по брендам и товарам. Назови 5 популярных брендов с конкретными товарами, которые могут соответствовать запросу: '${description}'. 

ОЧЕНЬ ВАЖНО: Твой ответ должен быть строго в формате массива JSON.

Формат ответа должен быть таким:
[
  {"brand": "Название бренда 1", "product": "Название товара 1", "description": "Описание товара 1"},
  {"brand": "Название бренда 2", "product": "Название товара 2", "description": "Описание товара 2"},
  {"brand": "Название бренда 3", "product": "Название товара 3", "description": "Описание товара 3"},
  {"brand": "Название бренда 4", "product": "Название товара 4", "description": "Описание товара 4"},
  {"brand": "Название бренда 5", "product": "Название товара 5", "description": "Описание товара 5"}
]`,
    options: {
      model: "gpt-4",
      max_tokens: 500,
      temperature: 0.3,
      responseFormat: "json_object"
    }
  });
  
  console.log('Результат от fetchBrandSuggestionsViaOpenAI:', result);
  
  // Возвращаем результат напрямую, парсинг будет выполнен в parseBrandApiResponse
  return result;
}

// Функция для поиска через Abacus
export async function searchViaAbacus(endpoint: string, requestData: Record<string, any>): Promise<any> {
  return callAIViaSupabase({
    provider: 'abacus',
    endpoint,
    requestData
  });
}
