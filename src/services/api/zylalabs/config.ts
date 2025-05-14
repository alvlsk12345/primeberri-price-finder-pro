
// Базовый URL API
export const BASE_URL = "https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products";

// Устанавливаем таймаут запросов как в HTML-примере
export const REQUEST_TIMEOUT = 30000; // 30 секунд

// API ключ для Zylalabs
export const ZYLALABS_API_KEY = '8124|JemZ3DKziYKrlw6KLiRTUzsm82AUlmjedviBpplx';

// Функция для автоматического сохранения API-ключа при первом запуске
const saveDefaultApiKey = () => {
  try {
    if (!localStorage.getItem('zylalabs_api_key')) {
      localStorage.setItem('zylalabs_api_key', ZYLALABS_API_KEY);
      console.log('API ключ Zylalabs автоматически сохранен в localStorage');
    }
  } catch (error) {
    console.error('Ошибка при сохранении начального API ключа Zylalabs:', error);
    // В случае ошибки не делаем ничего, просто логируем
  }
};

// Вызываем функцию сохранения ключа при импорте модуля
try {
  saveDefaultApiKey();
} catch (error) {
  console.error('Ошибка при инициализации API ключа Zylalabs:', error);
}

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
    
    // Если в localStorage хранится невалидный ключ, сбрасываем его и возвращаем дефолтный
    if (storedKey && !isValidApiKey(storedKey)) {
      console.warn('Обнаружен невалидный API ключ Zylalabs в localStorage, сбрасываем на дефолтный');
      try {
        localStorage.removeItem('zylalabs_api_key');
      } catch (e) {
        console.error('Ошибка при удалении невалидного ключа Zylalabs:', e);
      }
      return ZYLALABS_API_KEY;
    }
    
    // Если ключ есть в localStorage и он валиден, используем его, иначе возвращаем предустановленный ключ
    return storedKey || ZYLALABS_API_KEY;
  } catch (error) {
    console.error('Ошибка при получении API ключа Zylalabs:', error);
    return ZYLALABS_API_KEY;
  }
};

// Сохранение нового API ключа
export const setApiKey = (newKey: string): boolean => {
  try {
    if (isValidApiKey(newKey)) {
      localStorage.setItem('zylalabs_api_key', newKey);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Ошибка при сохранении API ключа Zylalabs:', error);
    return false;
  }
};

// Сброс API ключа на дефолтный
export const resetApiKey = (): boolean => {
  try {
    console.log('Выполняется сброс API ключа Zylalabs...');
    // Удаляем текущий ключ из localStorage
    localStorage.removeItem('zylalabs_api_key');
    // Устанавливаем дефолтный ключ
    localStorage.setItem('zylalabs_api_key', ZYLALABS_API_KEY);
    console.log('API ключ Zylalabs успешно сброшен на значение по умолчанию');
    return true;
  } catch (error) {
    console.error('Ошибка при сбросе API ключа Zylalabs:', error);
    return false;
  }
};
