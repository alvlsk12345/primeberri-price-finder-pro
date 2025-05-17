
/**
 * Сервис для управления API ключами различных сервисов
 */

// Типы API ключей, поддерживаемые приложением
export type ApiKeyType = 'zylalabs' | 'openai' | 'perplexity';

// Константы для хранения ключей в localStorage
export const API_KEY_STORAGE_KEYS: Record<ApiKeyType, string> = {
  'zylalabs': 'zylalabs-api-key',
  'openai': 'openai_api_key',
  'perplexity': 'perplexity_api_key'
};

// Названия API сервисов для отображения пользователю
export const API_SERVICE_NAMES: Record<ApiKeyType, string> = {
  'zylalabs': 'Zylalabs',
  'openai': 'OpenAI',
  'perplexity': 'Perplexity AI'
};

// URL-адреса для получения API ключей
export const API_KEY_URLS: Record<ApiKeyType, string> = {
  'zylalabs': 'https://zylalabs.com/api/2033/real+time+product+search+api',
  'openai': 'https://platform.openai.com/api-keys',
  'perplexity': 'https://www.perplexity.ai/settings'
};

/**
 * Получает API ключ для заданного сервиса
 * @param keyType Тип API ключа
 * @returns API ключ или пустую строку
 */
export const getApiKey = async (keyType: ApiKeyType): Promise<string> => {
  try {
    // Получаем название ключа для хранения
    const storageKey = API_KEY_STORAGE_KEYS[keyType];
    
    // Пытаемся получить ключ из Supabase Edge Function
    try {
      console.log(`Проверка наличия API ключа ${keyType} в Supabase Edge Functions...`);
      const response = await fetch('/api/api-key-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'get', key: storageKey })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.value) {
          console.log(`API ключ ${keyType} получен из Supabase Edge Functions (источник: ${data.source})`);
          return data.value;
        }
      }
    } catch (edgeFunctionError) {
      console.error(`Ошибка при получении API ключа ${keyType} из Supabase:`, edgeFunctionError);
      // Продолжаем и пробуем получить из localStorage, если Supabase недоступен
    }
    
    // В случае неудачи, проверяем localStorage
    const localKey = localStorage.getItem(storageKey);
    if (localKey) {
      console.log(`API ключ ${keyType} получен из localStorage`);
      return localKey;
    }
    
    // Если в localStorage нет, возвращаем пустую строку
    console.log(`API ключ ${keyType} не найден`);
    return '';
  } catch (e) {
    console.error(`Ошибка при получении API ключа ${keyType}:`, e);
    return '';
  }
};

/**
 * Сохраняет API ключ в localStorage и уведомляет Supabase о наличии ключа
 * @param keyType Тип API ключа
 * @param apiKey API ключ для сохранения
 * @returns true если успешно сохранен
 */
export const setApiKey = async (keyType: ApiKeyType, apiKey: string): Promise<boolean> => {
  try {
    // Получаем название ключа для хранения
    const storageKey = API_KEY_STORAGE_KEYS[keyType];
    
    // Сохраняем в localStorage
    localStorage.setItem(storageKey, apiKey);
    console.log(`API ключ ${keyType} успешно сохранен в localStorage`);
    
    // Пытаемся уведомить Supabase Edge Function о сохранении ключа
    try {
      const response = await fetch('/api/api-key-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'set', 
          key: storageKey,
          value: apiKey
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`Supabase Edge Function уведомлена о сохранении ключа ${keyType}`);
        } else {
          console.warn(`Предупреждение от Supabase Edge Function:`, data.message);
        }
      }
    } catch (edgeFunctionError) {
      console.error(`Ошибка при уведомлении Supabase Edge Function о ключе ${keyType}:`, edgeFunctionError);
      // Продолжаем, так как ключ уже сохранен в localStorage
    }
    
    return true;
  } catch (e) {
    console.error(`Ошибка при установке API ключа ${keyType}:`, e);
    return false;
  }
};

/**
 * Проверяет валидность API ключа для указанного сервиса
 * @param apiKey API ключ для проверки
 * @param keyType Тип API ключа
 * @returns true если ключ валидный
 */
export const isValidApiKey = (apiKey: string, keyType: ApiKeyType): boolean => {
  if (!apiKey || apiKey.length < 20) {
    return false;
  }
  
  // Можно добавить проверки для конкретных форматов ключей
  switch (keyType) {
    case 'openai':
      return /^sk-[A-Za-z0-9]{30,}$/.test(apiKey);
    case 'perplexity':
      return apiKey.length >= 30;
    case 'zylalabs':
    default:
      return apiKey.length >= 20;
  }
};

/**
 * Получает тестовый URL для проверки работоспособности API ключа
 * @param keyType Тип API ключа
 * @returns URL для тестового запроса
 */
export const getTestApiUrl = (keyType: ApiKeyType): string => {
  switch (keyType) {
    case 'zylalabs':
      return 'https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products?q=test&limit=1';
    case 'openai':
      return 'https://api.openai.com/v1/models';
    case 'perplexity':
      return 'https://api.perplexity.ai/chat/models';
    default:
      return '';
  }
};

/**
 * Формирует заголовки для API запроса
 * @param keyType Тип API ключа
 * @param apiKey API ключ
 * @returns Заголовки для запроса
 */
export const getApiHeaders = (keyType: ApiKeyType, apiKey: string): HeadersInit => {
  const commonHeaders = {
    'Content-Type': 'application/json'
  };
  
  switch (keyType) {
    case 'zylalabs':
      return {
        ...commonHeaders,
        'Authorization': `Bearer ${apiKey}`
      };
    case 'openai':
      return {
        ...commonHeaders,
        'Authorization': `Bearer ${apiKey}`
      };
    case 'perplexity':
      return {
        ...commonHeaders,
        'Authorization': `Bearer ${apiKey}`
      };
    default:
      return commonHeaders;
  }
};
