
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
    
    // Формируем данные запроса
    const requestData = {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: "text",
    };

    // Отправляем запрос к API перевода
    const response = await fetch(LIBRE_TRANSLATE_API_URL, {
      method: "POST",
      body: JSON.stringify(requestData),
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000), // Таймаут 10 секунд
    });

    // Проверяем успешность ответа
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ошибка при переводе:", errorText);
      return text; // В случае ошибки возвращаем исходный текст
    }

    // Парсим ответ
    const data = await response.json();
    
    if (data && data.translatedText) {
      console.log(`Перевод: "${data.translatedText}"`);
      return data.translatedText;
    } else {
      console.warn("Неожиданный формат ответа от API перевода:", data);
      return text;
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
  // Если запрос содержит русские символы, переводим его
  if (containsRussian(query)) {
    return await translateText(query);
  }
  // Иначе возвращаем запрос без изменений
  return query;
};
