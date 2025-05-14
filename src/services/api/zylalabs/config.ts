
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
export const getApiKey = (): string => {
  try {
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
export const setApiKey = (newKey: string): boolean => {
  try {
    if (isValidApiKey(newKey)) {
      localStorage.setItem('zylalabs_api_key', newKey);
      console.log('API ключ Zylalabs успешно сохранен');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Ошибка при сохранении API ключа Zylalabs:', error);
    return false;
  }
};

// Сброс API ключа на пустое значение
export const resetApiKey = (): boolean => {
  try {
    console.log('Выполняется полное удаление API ключа Zylalabs...');
    // Полностью удаляем ключ из localStorage
    localStorage.removeItem('zylalabs_api_key');
    console.log('API ключ Zylalabs успешно удален');
    
    // Принудительно форсируем очистку кэша
    window.sessionStorage.removeItem('zylalabs_cache');
    console.log('Кэш Zylalabs очищен');
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении API ключа Zylalabs:', error);
    return false;
  }
};
