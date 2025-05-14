
// Базовый URL API
export const BASE_URL = "https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products";

// Устанавливаем таймаут запросов как в HTML-примере
export const REQUEST_TIMEOUT = 30000; // 30 секунд

// API ключ для Zylalabs
export const ZYLALABS_API_KEY = '8124|JemZ3DKziYKrlw6KLiRTUzsm82AUlmjedviBpplx';

// Вспомогательная функция для безопасной проверки доступности localStorage
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test_zylalabs_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('[ZylalabsConfig] localStorage недоступен:', e);
    return false;
  }
}

// Функция для автоматического сохранения API-ключа при первом запуске
// ВАЖНО: эта функция больше не вызывается автоматически при импорте
const saveDefaultApiKey = () => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('[ZylalabsConfig] localStorage недоступен, ключ не будет сохранен');
      return;
    }
    
    if (!localStorage.getItem('zylalabs_api_key')) {
      localStorage.setItem('zylalabs_api_key', ZYLALABS_API_KEY);
      console.log('[ZylalabsConfig] API ключ Zylalabs автоматически сохранен в localStorage');
    }
  } catch (e) {
    console.error('[ZylalabsConfig] Ошибка при сохранении ключа по умолчанию:', e);
  }
};

// Проверяет валидность API ключа (базовая проверка формата)
const isValidApiKey = (key: string): boolean => {
  // Проверяем, что ключ содержит вертикальную черту и имеет примерно правильную структуру
  return key.includes('|') && key.length > 10;
};

// Получение API-ключа с проверкой валидности
export const getApiKey = (): string => {
  try {
    // Проверяем доступность localStorage перед любыми операциями
    if (!isLocalStorageAvailable()) {
      console.warn('[ZylalabsConfig] localStorage недоступен, возвращаем дефолтный ключ');
      return ZYLALABS_API_KEY;
    }
    
    const storedKey = localStorage.getItem('zylalabs_api_key');
    
    // Если ключа нет в localStorage, пробуем сохранить дефолтный
    if (!storedKey) {
      console.log('[ZylalabsConfig] Ключ не найден в localStorage, сохраняем дефолтный');
      try {
        saveDefaultApiKey();
        return ZYLALABS_API_KEY;
      } catch (e) {
        console.error('[ZylalabsConfig] Ошибка при сохранении дефолтного ключа:', e);
        return ZYLALABS_API_KEY;
      }
    }
    
    // Если в localStorage хранится невалидный ключ, сбрасываем его и возвращаем дефолтный
    if (!isValidApiKey(storedKey)) {
      console.warn('[ZylalabsConfig] Обнаружен невалидный API ключ Zylalabs в localStorage, сбрасываем на дефолтный');
      try {
        localStorage.removeItem('zylalabs_api_key');
      } catch (e) {
        console.error('[ZylalabsConfig] Ошибка при удалении невалидного ключа:', e);
      }
      return ZYLALABS_API_KEY;
    }
    
    // Если ключ есть в localStorage и он валиден, используем его
    return storedKey;
  } catch (e) {
    console.error('[ZylalabsConfig] Непредвиденная ошибка при получении API ключа:', e);
    return ZYLALABS_API_KEY; // В случае любой ошибки возвращаем дефолтный ключ
  }
};

// Сохранение нового API ключа
export const setApiKey = (newKey: string): boolean => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('[ZylalabsConfig] localStorage недоступен, ключ не будет сохранен');
      return false;
    }
    
    if (isValidApiKey(newKey)) {
      localStorage.setItem('zylalabs_api_key', newKey);
      return true;
    }
    return false;
  } catch (e) {
    console.error('[ZylalabsConfig] Ошибка при сохранении API ключа:', e);
    return false;
  }
};

// Сброс API ключа на дефолтный
export const resetApiKey = (): void => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('[ZylalabsConfig] localStorage недоступен, ключ не будет сброшен');
      return;
    }
    
    localStorage.setItem('zylalabs_api_key', ZYLALABS_API_KEY);
  } catch (e) {
    console.error('[ZylalabsConfig] Ошибка при сбросе API ключа:', e);
  }
};
