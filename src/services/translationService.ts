
/**
 * Сервис для перевода текста с использованием LibreTranslate API
 */

// URL API для перевода
const LIBRE_TRANSLATE_API_URL = "https://libretranslate.com/translate";

// Функция для перевода текста с одного языка на другой
export const translateText = async (
  text: string, 
  sourceLanguage: string = "ru", 
  targetLanguage: string = "en"
): Promise<string> => {
  try {
    console.log(`Переводим текст: "${text}" с ${sourceLanguage} на ${targetLanguage}`);
    
    // В случае если сервис LibreTranslate требует API ключ или недоступен,
    // возвращаем исходный текст вместо попытки перевода
    // Это позволит приложению продолжать работу даже при проблемах с сервисом перевода
    
    // Проверка на пустую строку или короткий текст - не переводим его
    if (!text || text.length < 2) {
      console.log("Текст слишком короткий для перевода, возвращаем оригинал");
      return text;
    }

    // Формируем данные запроса
    const requestData = {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: "text",
    };

    // Отправляем запрос к API перевода с таймаутом
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
    
    try {
      const response = await fetch(LIBRE_TRANSLATE_API_URL, {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Проверяем успешность ответа
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка при переводе:", errorText);
        return text; // В случае ошибки возвращаем исходный текст
      }

      // Парсим ответ
      const data = await response.json();
      
      if (data && data.translatedText) {
        console.log(`Перевод выполнен: "${data.translatedText}"`);
        return data.translatedText;
      } else {
        console.warn("Неожиданный формат ответа от API перевода:", data);
        return text;
      }
    } catch (fetchError) {
      console.warn("Ошибка запроса к API перевода:", fetchError);
      clearTimeout(timeoutId);
      return text; // При любой ошибке возвращаем исходный текст
    }
  } catch (error) {
    console.error("Ошибка при переводе текста:", error);
    return text; // В случае ошибки возвращаем исходный текст
  }
};

// Определение русских символов
const russianPattern = /[а-яА-ЯёЁ]/;

// Функция для проверки, содержит ли текст русские символы
export const containsRussian = (text: string): boolean => {
  return russianPattern.test(text);
};

// Функция для автоматического перевода запроса, если он на русском
export const autoTranslateQuery = async (query: string): Promise<string> => {
  try {
    // Если запрос содержит русские символы, переводим его
    if (containsRussian(query)) {
      const translated = await translateText(query);
      // Проверяем, не вернулась ли просто оригинальная строка в случае ошибки
      if (translated && translated !== query) {
        console.log(`Запрос переведен: "${query}" -> "${translated}"`);
        return translated;
      } else {
        console.log(`Запрос: "${query}" не удалось перевести, используем оригинал`);
      }
    } else {
      console.log(`Запрос: "${query}" не требует перевода`);
    }
    // Возвращаем запрос без изменений
    return query;
  } catch (error) {
    console.error("Ошибка при автопереводе запроса:", error);
    return query; // В случае ошибки возвращаем исходный запрос
  }
};
