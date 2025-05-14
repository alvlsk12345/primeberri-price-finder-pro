
import { SearchResult } from "@/services/types";
import { toast } from "@/components/ui/use-toast";

// Базовая функция для использования OpenAI API без CORS прокси
export const callOpenAI = async (prompt: string, options: any = {}): Promise<any> => {
  // Инициализируем обработчик ошибок
  const handleNetworkError = (error: any, prompt: string, options: any) => {
    console.error('Ошибка сети при запросе к OpenAI:', error);
    toast.error(`Произошла сетевая ошибка: ${error.message || 'Неизвестная ошибка сети'}`);
    throw error;
  };

  try {
    toast.error("Прямые запросы к OpenAI API из браузера блокируются политикой CORS. Пожалуйста, используйте Supabase Edge Function.", { duration: 6000 });
    throw new Error("CORS блокирует прямой доступ к OpenAI API. Используйте Supabase Edge Function.");
  } catch (error: any) {
    // Обработка ошибок без использования прокси
    console.error('Ошибка при запросе к OpenAI:', error);
    
    // Используем обработчик сетевых ошибок
    return handleNetworkError(error, prompt, options);
  }
};

// Заглушка для функции обработки ответа API
const processApiResponse = (content: any, format: string) => {
  console.log("Обработка ответа API", { content, format });
  return content;
};

// Заглушка для функции проверки статуса фоллбэка
async function isFallbackEnabled(): Promise<boolean> {
  return false;
}

// Экспортируем функцию поиска из отдельного файла
export { fetchFromOpenAI } from './searchService';
