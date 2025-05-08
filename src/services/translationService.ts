
/**
 * Сервис для перевода текста с использованием LibreTranslate API
 */

// URL API для перевода
const LIBRE_TRANSLATE_API_URL = "https://libretranslate.com/translate";
// API ключ для LibreTranslate (если есть)
const LIBRE_TRANSLATE_API_KEY = ""; // Нужно получить ключ на https://portal.libretranslate.com

// Функция для перевода текста с одного языка на другой
export const translateText = async (
  text: string, 
  sourceLanguage: string = "en", 
  targetLanguage: string = "ru"
): Promise<string> => {
  try {
    console.log(`Переводим текст с ${sourceLanguage} на ${targetLanguage}: "${text.substring(0, 50)}..."`);
    
    // Проверка на пустую строку или короткий текст - не переводим его
    if (!text || text.length < 2) {
      console.log("Текст слишком короткий для перевода, возвращаем оригинал");
      return text;
    }

    // Проверяем, нужен ли перевод (если текст уже на целевом языке)
    if ((targetLanguage === 'ru' && containsRussian(text)) || 
        (sourceLanguage === 'ru' && containsRussian(text) && targetLanguage !== 'ru')) {
      console.log("Текст уже на целевом языке, возвращаем оригинал");
      return text;
    }
    
    // Для больших текстов, которые могут быть описаниями товаров,
    // предварительно определим язык, чтобы уточнить направление перевода
    if (text.length > 100) {
      const detectedLanguage = containsRussian(text) ? "ru" : "en";
      if (detectedLanguage === targetLanguage) {
        console.log(`Текст уже на языке ${targetLanguage}, возвращаем оригинал`);
        return text;
      }
      // Обновляем исходный язык на основе определения
      sourceLanguage = detectedLanguage;
    }

    // СИМУЛЯЦИЯ ПЕРЕВОДА: Если API недоступен из-за лимитов, симулируем перевод для демонстрации
    try {
      // Формируем данные запроса
      const requestData = {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: "text",
        api_key: LIBRE_TRANSLATE_API_KEY || undefined,
      };

      // Отправляем запрос к API перевода с таймаутом
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
      
      try {
        // Добавляем уведомление о начале перевода
        console.log(`Отправляем запрос на перевод текста длиной ${text.length} символов`);
        
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
          const errorResponse = await response.json();
          console.error("Ошибка при переводе:", errorResponse);
          
          // Если API требует ключ или достигнут лимит, используем заглушку
          if (errorResponse.error && (
              errorResponse.error.includes("API-ключа") || 
              errorResponse.error.includes("Притормозите") ||
              errorResponse.error.includes("per hour")
          )) {
            throw new Error("API_LIMIT");
          }
          
          return text; // В случае других ошибок возвращаем исходный текст
        }

        // Парсим ответ
        const data = await response.json();
        
        if (data && data.translatedText) {
          console.log(`Перевод выполнен успешно. Результат: "${data.translatedText.substring(0, 50)}..."`);
          return data.translatedText;
        } else {
          console.warn("Неожиданный формат ответа от API перевода:", data);
          throw new Error("UNEXPECTED_RESPONSE");
        }
      } catch (fetchError: any) {
        console.warn("Ошибка запроса к API перевода:", fetchError);
        clearTimeout(timeoutId);
        
        // Проверяем тип ошибки
        if (fetchError.message === "API_LIMIT" || fetchError.message === "UNEXPECTED_RESPONSE") {
          throw fetchError;
        }
        
        return text; // При любой другой ошибке возвращаем исходный текст
      }
    } catch (apiError: any) {
      // Если проблема с API, используем заглушку для демонстрации
      if (apiError.message === "API_LIMIT" || apiError.message === "UNEXPECTED_RESPONSE") {
        console.log("Используем симуляцию перевода из-за ограничений API");
        
        // Простая симуляция перевода для демонстрации
        if (sourceLanguage === "en" && targetLanguage === "ru") {
          return simulateEnglishToRussianTranslation(text);
        } else if (sourceLanguage === "ru" && targetLanguage === "en") {
          return simulateRussianToEnglishTranslation(text);
        }
      }
      
      return text;
    }
  } catch (error) {
    console.error("Ошибка при переводе текста:", error);
    return text; // В случае ошибки возвращаем исходный текст
  }
};

// Простая симуляция перевода с английского на русский
function simulateEnglishToRussianTranslation(text: string): string {
  // Добавляем префикс, чтобы было понятно что это симуляция
  return "[РУС] " + text
    .replace(/product/gi, "товар")
    .replace(/price/gi, "цена")
    .replace(/features/gi, "функции")
    .replace(/quality/gi, "качество")
    .replace(/good/gi, "хороший")
    .replace(/best/gi, "лучший")
    .replace(/new/gi, "новый")
    .replace(/with/gi, "с")
    .replace(/and/gi, "и")
    .replace(/or/gi, "или")
    .replace(/the/gi, "")
    .replace(/a /gi, "");
}

// Простая симуляция перевода с русского на английский
function simulateRussianToEnglishTranslation(text: string): string {
  // Добавляем префикс, чтобы было понятно что это симуляция
  return "[ENG] " + text
    .replace(/товар/gi, "product")
    .replace(/цена/gi, "price")
    .replace(/функции/gi, "features")
    .replace(/качество/gi, "quality")
    .replace(/хороший/gi, "good")
    .replace(/лучший/gi, "best")
    .replace(/новый/gi, "new")
    .replace(/с /gi, "with ")
    .replace(/ и /gi, " and ")
    .replace(/ или /gi, " or ");
}

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
      const translated = await translateText(query, "ru", "en");
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
