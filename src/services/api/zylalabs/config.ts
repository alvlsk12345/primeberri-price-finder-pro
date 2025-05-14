
// Базовый URL API
export const BASE_URL = "https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products";

// Устанавливаем таймаут запросов как в HTML-примере
export const REQUEST_TIMEOUT = 30000; // 30 секунд

// API ключ для Zylalabs
export const ZYLALABS_API_KEY = '8124|JemZ3DKziYKrlw6KLiRTUzsm82AUlmjedviBpplx';

// Функция для автоматического сохранения API-ключа при первом запуске
const saveDefaultApiKey = () => {
  if (!localStorage.getItem('zylalabs_api_key')) {
    localStorage.setItem('zylalabs_api_key', ZYLALABS_API_KEY);
    console.log('API ключ Zylalabs автоматически сохранен в localStorage');
  }
};

// Вызываем функцию сохранения ключа при импорте модуля
saveDefaultApiKey();

// Проверяет валидность API ключа (базовая проверка формата)
const isValidApiKey = (key: string): boolean => {
  // Проверяем, что ключ содержит вертикальную черту и имеет примерно правильную структуру
  return key.includes('|') && key.length > 10;
};

// Получение API-ключа с проверкой валидности
export const getApiKey = (): string => {
  const storedKey = localStorage.getItem('zylalabs_api_key');
  
  // Если в localStorage хранится невалидный ключ, сбрасываем его и возвращаем дефолтный
  if (storedKey && !isValidApiKey(storedKey)) {
    console.warn('Обнаружен невалидный API ключ Zylalabs в localStorage, сбрасываем на дефолтный');
    localStorage.removeItem('zylalabs_api_key');
    return ZYLALABS_API_KEY;
  }
  
  // Если ключ есть в localStorage и он валиден, используем его, иначе возвращаем предустановленный ключ
  return storedKey || ZYLALABS_API_KEY;
};

// Сохранение нового API ключа
export const setApiKey = (newKey: string): boolean => {
  if (isValidApiKey(newKey)) {
    localStorage.setItem('zylalabs_api_key', newKey);
    return true;
  }
  return false;
};

// Сброс API ключа на дефолтный
export const resetApiKey = (): void => {
  localStorage.setItem('zylalabs_api_key', ZYLALABS_API_KEY);
};
