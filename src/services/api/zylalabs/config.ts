
// Базовый URL API
export const BASE_URL = "https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products";

// Устанавливаем таймаут запросов как в HTML-примере
export const REQUEST_TIMEOUT = 30000; // 30 секунд

// API ключ для Zylalabs
export const ZYLALABS_API_KEY = '';

// Проверяет валидность API ключа (базовая проверка формата)
const isValidApiKey = (key: string): boolean => {
  try {
    // Проверяем, что ключ содержит вертикальную черту и имеет примерно правильную структуру
    return key && typeof key === 'string' && key.includes('|') && key.length > 10;
  } catch (error) {
    console.error('Ошибка при проверке валидности API ключа Zylalabs:', error);
    return false;
  }
};

// Получение API-ключа с проверкой валидности
export const getApiKey = async (): Promise<string> => {
  try {
    // Сначала пытаемся получить ключ из Supabase Edge Function
    try {
      const response = await fetch('https://juacmpkewomkducoanle.supabase.co/functions/v1/api-key-manager?provider=zylalabs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.key && isValidApiKey(data.key)) {
          console.log('Успешно получен API ключ Zylalabs из Supabase');
          return data.key;
        }
      } else {
        console.warn('Не удалось получить API ключ Zylalabs из Supabase:', await response.text());
      }
    } catch (err) {
      console.warn('Ошибка при запросе API ключа Zylalabs из Supabase:', err);
    }
    
    // Если не удалось получить из Supabase, используем локальное хранилище
    const storedKey = localStorage.getItem('zylalabs_api_key');
    
    // Если в localStorage хранится невалидный ключ, сбрасываем его и возвращаем пустую строку
    if (storedKey && !isValidApiKey(storedKey)) {
      console.warn('Обнаружен невалидный API ключ Zylalabs в localStorage, удаляем его');
      try {
        localStorage.removeItem('zylalabs_api_key');
      } catch (e) {
        console.error('Ошибка при удалении невалидного ключа Zylalabs:', e);
      }
      return '';
    }
    
    // Если ключ есть в localStorage и он валиден, используем его, иначе возвращаем пустую строку
    return storedKey || '';
  } catch (error) {
    console.error('Ошибка при получении API ключа Zylalabs:', error);
    return '';
  }
};

// Сохранение нового API ключа
export const setApiKey = async (newKey: string): Promise<boolean> => {
  try {
    if (isValidApiKey(newKey)) {
      // Попытка сохранить ключ в Supabase
      try {
        const response = await fetch('https://juacmpkewomkducoanle.supabase.co/functions/v1/api-key-manager', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: 'zylalabs',
            key: newKey
          })
        });
        
        if (response.ok) {
          console.log('API ключ Zylalabs успешно сохранен в Supabase');
          // Также сохраняем в localStorage для резервного доступа
          localStorage.setItem('zylalabs_api_key', newKey);
          return true;
        } else {
          console.warn('Не удалось сохранить API ключ Zylalabs в Supabase, сохраняем только локально');
        }
      } catch (err) {
        console.warn('Ошибка при сохранении API ключа Zylalabs в Supabase:', err);
      }
      
      // Если не удалось сохранить в Supabase, сохраняем только в localStorage
      localStorage.setItem('zylalabs_api_key', newKey);
      console.log('API ключ Zylalabs сохранен локально');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Ошибка при сохранении API ключа Zylalabs:', error);
    return false;
  }
};

// Сброс API ключа на пустое значение
export const resetApiKey = async (): Promise<boolean> => {
  try {
    console.log('Выполняется полное удаление API ключа Zylalabs...');
    
    // Удаляем ключ из Supabase
    try {
      const response = await fetch('https://juacmpkewomkducoanle.supabase.co/functions/v1/api-key-manager', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'zylalabs'
        })
      });
      
      if (response.ok) {
        console.log('API ключ Zylalabs успешно удален из Supabase');
      } else {
        console.warn('Не удалось удалить API ключ Zylalabs из Supabase:', await response.text());
      }
    } catch (err) {
      console.warn('Ошибка при удалении API ключа Zylalabs из Supabase:', err);
    }
    
    // Полностью удаляем ключ из localStorage
    localStorage.removeItem('zylalabs_api_key');
    console.log('API ключ Zylalabs успешно удален из локального хранилища');
    
    // Принудительно форсируем очистку кэша
    window.sessionStorage.removeItem('zylalabs_cache');
    console.log('Кэш Zylalabs очищен');
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении API ключа Zylalabs:', error);
    return false;
  }
};
