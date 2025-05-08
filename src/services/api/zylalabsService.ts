
import { toast } from "@/components/ui/sonner";
import { SearchParams } from "../types";

// Константа для хранения API ключа Zylalabs
const ZYLALABS_API_KEY = "8103|qZi97eieReCKmFs6mwcg9Mf1H2JjJfGgdesU59tv";

// Максимальное количество попыток запроса к API
const MAX_RETRY_ATTEMPTS = 3;
// Задержка между повторными попытками (в миллисекундах)
const RETRY_DELAY = 1000;

/**
 * Функция для установки паузы в заданное количество миллисекунд
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для поиска товаров через Zylalabs API с поддержкой пагинацией и повторными попытками
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<any> => {
  let attempts = 0;
  let lastError = null;

  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      console.log(`Отправляем запрос к Zylalabs API... (попытка ${attempts + 1}/${MAX_RETRY_ATTEMPTS})`, params);
      
      // Кодируем параметры запроса
      const encodedQuery = encodeURIComponent(params.query);
      const page = params.page || 1;
      const country = params.country || 'us';
      const language = params.language || 'en';
      
      // Добавляем параметр source=merchant, чтобы получать карточки из конечных магазинов
      const apiUrl = `https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products?q=${encodedQuery}&country=${country}&language=${language}&page=${page}&source=merchant`;
      
      console.log('URL запроса:', apiUrl);
      
      // Выполняем запрос к API с таймаутом в 15 секунд
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Расширенная обработка ошибок
      if (!response.ok) {
        let errorMessage = '';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || `Ошибка API: ${response.status}`;
        } catch (e) {
          errorMessage = await response.text() || `Ошибка API: ${response.status}`;
        }
        
        console.error('Ошибка от API Zylalabs:', errorMessage);
        
        // Особая обработка для разных статусных кодов
        if (response.status === 401) {
          toast.error("Ошибка авторизации API. Проверьте ключ API.");
          throw new Error("Ошибка авторизации API Zylalabs");
        } else if (response.status === 429) {
          toast.error("Превышен лимит запросов API. Пожалуйста, попробуйте позже.");
          throw new Error("Превышен лимит запросов API Zylalabs");
        } else if (response.status === 400) {
          toast.error(`Некорректный запрос: ${errorMessage}`);
          throw new Error(`Некорректный запрос: ${errorMessage}`);
        } else if (response.status === 503) {
          console.warn('Сервис временно недоступен, попытка повтора через', RETRY_DELAY);
          lastError = new Error(`Сервис временно недоступен: ${errorMessage}`);
          // Увеличиваем счетчик попыток и делаем паузу перед следующей попыткой
          attempts++;
          await sleep(RETRY_DELAY);
          continue; // Переходим к следующей попытке
        } else {
          toast.error(`Ошибка API: ${errorMessage}`);
          throw new Error(`Ошибка API Zylalabs: ${errorMessage}`);
        }
      }

      // Парсим JSON ответ
      const data = await response.json();
      console.log('Получен ответ от Zylalabs API:', data);
      
      // Проверяем структуру данных с расширенной проверкой формата
      let products = [];
      let total = 0;
      
      if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
        // Новый формат API
        products = data.data.products;
        total = data.data.total_results || products.length;
      } else if (data && Array.isArray(data.products)) {
        // Старый формат
        products = data.products;
        total = data.total_results || products.length;
      } else if (data && Array.isArray(data)) {
        // Прямой массив
        products = data;
        total = products.length;
      } else {
        console.error('Неожиданный формат ответа от API:', data);
        toast.warning('Получены некорректные данные от API');
        return { products: [], total: 0 };
      }
      
      // Успешный ответ - возвращаем результаты
      return { products, total };
    } catch (error: any) {
      // Обрабатываем ошибку прерывания запроса при истечении таймаута
      if (error.name === 'AbortError') {
        console.warn('Запрос был отменен из-за истечения времени ожидания, попытка повтора');
        lastError = error;
        attempts++;
        await sleep(RETRY_DELAY);
        continue; // Переходим к следующей попытке
      }
      
      // Для других ошибок - логируем и выбрасываем исключение
      console.error('Ошибка при запросе к Zylalabs API:', error);
      
      // Добавляем дополнительную информацию об ошибке для пользователя
      if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        toast.error('Проблема с сетью. Проверьте подключение к интернету');
      } else {
        toast.error('Ошибка при получении данных о товарах');
      }
      
      // Увеличиваем счетчик попыток
      lastError = error;
      attempts++;
      
      if (attempts < MAX_RETRY_ATTEMPTS) {
        console.log(`Повторная попытка ${attempts}/${MAX_RETRY_ATTEMPTS} через ${RETRY_DELAY}мс`);
        await sleep(RETRY_DELAY);
        continue; // Переходим к следующей попытке
      } else {
        throw error; // Больше попыток не осталось, выбрасываем исключение
      }
    }
  }
  
  // Если все попытки исчерпаны, выбрасываем последнюю ошибку
  if (lastError) {
    console.error('Все попытки запросов исчерпаны:', lastError);
    toast.error('Не удалось получить данные после нескольких попыток');
    throw lastError;
  }
  
  // Этот код никогда не должен выполняться, но нужен для типизации
  return { products: [], total: 0 };
};
