
import { toast } from "sonner";

// Функция для проверки наличия кириллических символов в строке
export const containsCyrillicCharacters = (text: string): boolean => {
  // Регулярное выражение для проверки кириллицы (русские буквы)
  const cyrillicPattern = /[\u0400-\u04FF]/;
  return cyrillicPattern.test(text);
};

// Простой API для перевода текста с использованием бесплатного сервиса
export const translateToEnglish = async (text: string): Promise<string> => {
  try {
    // Проверяем, нужен ли перевод (есть ли кириллические символы)
    if (!containsCyrillicCharacters(text)) {
      return text;
    }
    
    console.log('Переводим запрос с русского на английский:', text);
    
    // Используем бесплатный API для перевода
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|en`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка перевода: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Получаем переведенный текст
    const translatedText = data.responseData?.translatedText || text;
    console.log('Переведенный запрос:', translatedText);
    
    // Возвращаем переведенный текст, очищенный от специальных символов
    return translatedText.replace(/[^\w\s]/gi, ' ').trim();
  } catch (error) {
    console.error('Ошибка при переводе:', error);
    toast.error('Произошла ошибка при переводе запроса');
    return text; // В случае ошибки возвращаем исходный текст
  }
};

// Хук для использования переводов в компонентах
export const useTranslation = () => {
  // Простая функция перевода для использования в компонентах
  const t = (text: string): string => {
    // В данной реализации просто возвращаем текст как есть
    // В будущем можно добавить словари переводов
    return text;
  };

  return { t };
};
