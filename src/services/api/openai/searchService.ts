
import { toast } from "sonner";
import { callOpenAI } from "./apiClient";
import { createMockProductsFromQuery } from "./responseUtils";
import { isUsingSupabaseBackend, isFallbackEnabled } from "../supabase/config";
import { searchViaOpenAI } from "../supabase/aiService";
import { isSupabaseConnected } from "../supabase/client";

// Специфичная функция для общего использования OpenAI API для поиска товаров
export const fetchFromOpenAI = async (query: string): Promise<any> => {
  try {
    // Проверяем, используем ли мы Supabase бэкенд
    if (isUsingSupabaseBackend() && await isSupabaseConnected()) {
      console.log('Использование Supabase для поиска товаров через OpenAI');
      try {
        // Используем Supabase Edge Function для вызова OpenAI
        const results = await searchViaOpenAI(query);
        console.log('Результаты от Supabase OpenAI поиска:', results);
        
        // Проверяем, возвращен ли массив результатов
        if (Array.isArray(results)) {
          if (results.length === 0) {
            toast.info('По вашему запросу не найдено товаров. Попробуйте изменить запрос.', { duration: 4000 });
            console.log('OpenAI не нашел товары по запросу:', query);
          }
          return results;
        }
        
        // Проверяем на наличие ошибки в ответе
        if (results && results.error) {
          console.error('Ошибка от Supabase OpenAI:', results.error);
          toast.error(`Ошибка поиска: ${results.error}`, { duration: 3000 });
          throw new Error(results.error);
        }
        
        return results;
      } catch (error) {
        console.error('Ошибка при использовании Supabase для поиска товаров:', error);
        
        // Если включен фоллбэк, продолжаем с прямым вызовом
        if (isFallbackEnabled()) {
          toast.info('Переключение на прямой вызов API OpenAI...', { duration: 2000 });
        } else {
          throw error;
        }
      }
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

    console.log('Прямой запрос к OpenAI с промптом:', promptTemplate);
    const result = await callOpenAI(promptTemplate, {
      responseFormat: "json_object",
      temperature: 0.2,
      max_tokens: 1000
    });
    
    // Добавляем подробное логирование результата
    console.log('Результат прямого запроса к OpenAI:', result);
    
    // Проверка на пустой массив
    if (Array.isArray(result) && result.length === 0) {
      console.log('OpenAI вернул пустой массив для запроса:', query);
      toast.info('По вашему запросу не найдено товаров. Попробуйте изменить запрос.', { duration: 4000 });
    }
    
    // Проверка на корректность формата
    if (!Array.isArray(result)) {
      console.warn('OpenAI вернул результат в неожиданном формате:', result);
      toast.error('Получен неверный формат данных от API. Используем демо-данные.', { duration: 3000 });
      return createMockProductsFromQuery(query);
    }
    
    return result;
  } catch (error) {
    console.error('Ошибка при запросе к OpenAI:', error);
    
    // Возвращаем демо-данные в случае ошибки
    toast.warning("Не удалось получить данные от OpenAI API. Используем демо-данные.", { duration: 3000 });
    
    // Создаем шаблонные товары на основе запроса
    return createMockProductsFromQuery(query);
  }
};
