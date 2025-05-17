
/**
 * Имя API ключа в local storage
 */
export const ZYLALABS_API_KEY = 'zylalabs-api-key';

/**
 * Базовый URL для API запросов
 * Используем правильный домен и формат URL с плюсами вместо дефисов согласно документации
 */
export const BASE_URL = 'https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products';

/**
 * Таймаут для запросов в миллисекундах (30 секунд)
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Получает API ключ сначала из Supabase Edge Function, затем из localStorage
 * @returns API ключ или пустую строку
 */
export const getApiKey = async (): Promise<string> => {
  try {
    // Пытаемся получить ключ из Supabase Edge Function
    try {
      console.log('Проверка наличия API ключа в Supabase Edge Functions...');
      const response = await fetch('/api/api-key-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'get', key: ZYLALABS_API_KEY })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.value) {
          console.log(`API ключ получен из Supabase Edge Functions (источник: ${data.source})`);
          return data.value;
        }
      }
    } catch (edgeFunctionError) {
      console.error('Ошибка при получении API ключа из Supabase:', edgeFunctionError);
      // Продолжаем и пробуем получить из localStorage, если Supabase недоступен
    }
    
    // В случае неудачи, проверяем localStorage
    const localKey = localStorage.getItem(ZYLALABS_API_KEY);
    if (localKey) {
      console.log('API ключ получен из localStorage');
      return localKey;
    }
    
    // Если в localStorage нет, возвращаем пустую строку
    console.log('API ключ не найден');
    return '';
  } catch (e) {
    console.error('Ошибка при получении API ключа:', e);
    return '';
  }
};

/**
 * Сохраняет API ключ в localStorage и уведомляет Supabase о наличии ключа
 * @param apiKey API ключ для сохранения
 * @returns true если успешно сохранен
 */
export const setApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Сохраняем в localStorage
    localStorage.setItem(ZYLALABS_API_KEY, apiKey);
    console.log('API ключ успешно сохранен в localStorage');
    
    // Пытаемся уведомить Supabase Edge Function о сохранении ключа
    try {
      const response = await fetch('/api/api-key-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'set', 
          key: ZYLALABS_API_KEY,
          value: apiKey
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Supabase Edge Function уведомлена о сохранении ключа');
        } else {
          console.warn('Предупреждение от Supabase Edge Function:', data.message);
        }
      }
    } catch (edgeFunctionError) {
      console.error('Ошибка при уведомлении Supabase Edge Function:', edgeFunctionError);
      // Продолжаем, так как ключ уже сохранен в localStorage
    }
    
    return true;
  } catch (e) {
    console.error('Ошибка при установке API ключа:', e);
    return false;
  }
};
