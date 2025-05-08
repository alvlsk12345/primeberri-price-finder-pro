
import { toast } from "@/components/ui/sonner";
import { SearchParams } from "../types";

// Константа для хранения API ключа Zylalabs
const ZYLALABS_API_KEY = "8103|qZi97eieReCKmFs6mwcg9Mf1H2JjJfGgdesU59tv";

// Фунцкия для поиска товаров через Zylalabs API с поддержкой пагинацией
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<any> => {
  try {
    console.log('Отправляем запрос к Zylalabs API...', params);
    
    // Кодируем параметры запроса
    const encodedQuery = encodeURIComponent(params.query);
    const page = params.page || 1;
    const country = params.country || 'us';
    const language = params.language || 'en';
    
    // Добавляем параметр source=merchant, чтобы получать карточки из конечных магазинов
    const apiUrl = `https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products?q=${encodedQuery}&country=${country}&language=${language}&page=${page}&source=merchant`;
    
    console.log('URL запроса:', apiUrl);
    
    // Выполняем запрос к API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

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
      
      if (response.status === 401) {
        toast.error("Ошибка авторизации API. Проверьте ключ API.");
        throw new Error("Ошибка авторизации API Zylalabs");
      } else if (response.status === 429) {
        toast.error("Превышен лимит запросов API. Пожалуйста, попробуйте позже.");
        throw new Error("Превышен лимит запросов API Zylalabs");
      } else if (response.status === 400) {
        toast.error(`Некорректный запрос: ${errorMessage}`);
        throw new Error(`Некорректный запрос: ${errorMessage}`);
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
    
    return { products, total };
  } catch (error: any) {
    console.error('Ошибка при запросе к Zylalabs API:', error);
    
    // Добавляем дополнительную информацию об ошибке для пользователя
    if (error.name === 'AbortError') {
      toast.error('Запрос был отменен из-за истечения времени ожидания');
    } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      toast.error('Проблема с сетью. Проверьте подключение к интернету');
    } else {
      toast.error('Ошибка при получении данных о товарах');
    }
    
    throw error;
  }
};
