
import { toast } from "@/components/ui/sonner";

// Константа для хранения API ключа Zylalabs
const ZYLALABS_API_KEY = "8103|qZi97eieReCKmFs6mwcg9Mf1H2JjJfGgdesU59tv";

// Фунцкия для поиска товаров через Zylalabs API
export const searchProductsViaZylalabs = async (query: string): Promise<any> => {
  try {
    console.log('Отправляем запрос к Zylalabs API...', query);
    
    // Кодируем параметры запроса
    const encodedQuery = encodeURIComponent(query);
    
    // Формируем URL для запроса
    const apiUrl = `https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products?q=${encodedQuery}&country=us&language=en`;
    
    // Выполняем запрос к API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Проверяем ответ
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка от API Zylalabs:', errorText);
      
      if (response.status === 401) {
        toast.error("Ошибка авторизации API. Проверьте ключ API.");
        throw new Error("Ошибка авторизации API Zylalabs");
      } else if (response.status === 429) {
        toast.error("Превышен лимит запросов API. Пожалуйста, попробуйте позже.");
        throw new Error("Превышен лимит запросов API Zylalabs");
      } else {
        toast.error(`Ошибка API: ${response.status}`);
        throw new Error(`Ошибка API Zylalabs: ${response.status}`);
      }
    }

    // Парсим JSON ответ
    const data = await response.json();
    console.log('Получен ответ от Zylalabs API:', data);
    
    // Проверяем структуру данных - исправляем под новый формат API
    if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
      return data.data.products;
    } else if (data && Array.isArray(data.products)) {
      // Старый формат
      return data.products;
    } else {
      console.error('Неожиданный формат ответа от API:', data);
      toast.warning('Получены некорректные данные от API');
      return [];
    }
  } catch (error) {
    console.error('Ошибка при запросе к Zylalabs API:', error);
    toast.error('Ошибка при получении данных о товарах');
    throw error;
  }
};
