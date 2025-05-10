
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

// Получение API-ключа из локального хранилища или использование предустановленного ключа
export const getApiKey = (): string => {
  const storedKey = localStorage.getItem('zylalabs_api_key');
  // Если ключ есть в localStorage, используем его, иначе возвращаем предустановленный ключ
  return storedKey || ZYLALABS_API_KEY;
};
