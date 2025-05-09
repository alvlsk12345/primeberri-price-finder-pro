
import { toast } from "@/components/ui/sonner";
import { SearchParams } from "../types";

// Константа для хранения API ключа Zylalabs
const ZYLALABS_API_KEY = "8103|qZi97eieReCKmFs6mwcg9Mf1H2JjJfGgdesU59tv";

// Максимальное количество попыток запроса к API
const MAX_RETRY_ATTEMPTS = 3;
// Задержка между повторными попытками (в миллисекундах)
const RETRY_DELAY = 1000;

// Проверка наличия ключа API
const checkApiKey = () => {
  if (!ZYLALABS_API_KEY) {
    console.error('API ключ Zylalabs не настроен');
    toast.error('API ключ не настроен. Пожалуйста, проверьте настройки.');
    return false;
  }
  return true;
};

/**
 * Функция для установки паузы в заданное количество миллисекунд
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Мок-данные для использования при сбоях API
const getMockSearchResults = (query: string) => {
  console.log('Используем мок-данные для запроса:', query);
  
  // Базовые элементы для всех запросов
  const baseProducts = [
    {
      id: 'mock-1',
      title: 'Демонстрационный товар 1',
      subtitle: 'Тестовый товар для демонстрации функционала',
      price: '1999 руб.',
      currency: 'RUB',
      image: 'https://via.placeholder.com/300x300?text=Демо+Товар+1',
      link: 'https://example.com/product1',
      rating: 4.5,
      source: 'Demo Shop',
      description: 'Это демонстрационный товар, созданный системой при недоступности API поиска.',
      availability: 'В наличии',
      brand: 'Demo Brand',
    },
    {
      id: 'mock-2',
      title: 'Демонстрационный товар 2',
      subtitle: 'Альтернативный тестовый товар',
      price: '3499 руб.',
      currency: 'RUB',
      image: 'https://via.placeholder.com/300x300?text=Демо+Товар+2',
      link: 'https://example.com/product2',
      rating: 3.8,
      source: 'Example Store',
      description: 'Это второй демонстрационный товар для тестирования интерфейса.',
      availability: 'Под заказ',
      brand: 'Test Brand',
    },
  ];
  
  // Добавляем товар, связанный с запросом пользователя
  const queryRelatedProduct = {
    id: 'mock-query',
    title: `${query} - демонстрационный товар`,
    subtitle: `Товар, связанный с запросом "${query}"`,
    price: '2499 руб.',
    currency: 'RUB',
    image: `https://via.placeholder.com/300x300?text=${encodeURIComponent(query)}`,
    link: 'https://example.com/product-query',
    rating: 4.2,
    source: 'Search Demo',
    description: `Это демонстрационный товар, связанный с вашим запросом "${query}". Создан при недоступности API поиска.`,
    availability: 'Ограниченное количество',
    brand: query.split(' ')[0] || 'Query Brand',
  };
  
  return {
    products: [queryRelatedProduct, ...baseProducts],
    total: 3
  };
};

// Функция для поиска товаров через Zylalabs API с поддержкой пагинацией и повторными попытками
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<any> => {
  // Проверяем наличие API ключа
  if (!checkApiKey()) {
    return getMockSearchResults(params.query);
  }
  
  let attempts = 0;
  let lastError = null;

  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      console.log(`Отправляем запрос к Zylalabs API... (попытка ${attempts + 1}/${MAX_RETRY_ATTEMPTS})`, params);
      
      // Кодируем параметры запроса
      const encodedQuery = encodeURIComponent(params.query);
      const page = params.page || 1;
      
      // Устанавливаем страны Европы (Великобритания, Германия, Франция) и английский язык
      // 'gb' - Великобритания, 'de' - Германия, 'fr' - Франция
      // В Zylalabs API нельзя указать несколько стран, поэтому выбираем приоритетные европейские страны
      const country = params.country || 'gb'; // По умолчанию Великобритания
      const language = params.language || 'en'; // Английский язык
      
      // Используем параметр source=merchant для получения карточек из конечных магазинов
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
        return getMockSearchResults(params.query);
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
      }
    }
  }
  
  // Если все попытки исчерпаны, используем мок-данные
  console.error('Все попытки запросов исчерпаны:', lastError);
  toast.error('Не удалось подключиться к API поиска. Используем демонстрационные данные.');
  
  // Возвращаем мок-данные для демонстрации интерфейса
  return getMockSearchResults(params.query);
};
