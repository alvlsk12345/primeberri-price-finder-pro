
import { BASE_URL } from "./config";
import { SearchParams } from "../../types";

/**
 * Кодирует кириллические и другие специальные символы в строке для URL
 * @param str Строка для кодирования
 * @returns Закодированная строка
 */
const encodeSpecialChars = (str: string): string => {
  // Кодируем кириллицу и другие специальные символы для URL
  try {
    return encodeURIComponent(str)
      .replace(/%20/g, '+') // Заменяем пробелы на плюсы согласно стандарту URL
      .replace(/%2C/g, ','); // Оставляем запятые как есть для лучшей читаемости
  } catch (error) {
    console.error('Ошибка кодирования строки для URL:', error);
    return encodeURIComponent(str); // Возвращаем стандартное кодирование в случае ошибки
  }
};

/**
 * Строит URL для запроса к API на основе параметров поиска
 * @param params Параметры поиска
 * @returns URL для запроса к API
 */
export const buildUrl = (params: SearchParams): string => {
  // Начинаем с базового URL
  let url = BASE_URL;
  
  // Добавляем обязательный параметр запроса
  // Используем encodeSpecialChars для корректной обработки кириллицы
  url += `?q=${encodeSpecialChars(params.query)}`;
  
  // Добавляем параметр страницы, если он указан
  if (params.page && params.page > 1) {
    url += `&page=${params.page}`;
  } else {
    url += '&page=1'; // По умолчанию первая страница
  }
  
  // Добавляем параметр языка, если он указан
  if (params.language) {
    url += `&language=${params.language}`;
  }
  
  // Добавляем параметр страны, если он указан
  // Используем только первую страну из массива (текущая логика API)
  if (params.countries && params.countries.length > 0) {
    url += `&country=${params.countries[0]}`;
  }
  
  // Добавляем ограничение по количеству результатов, если оно указано
  if (params.limit) {
    url += `&limit=${params.limit}`;
  } else {
    url += '&limit=10'; // По умолчанию 10 результатов
  }
  
  // Выводим URL в консоль для отладки
  console.log('Построенный URL для API:', url);
  
  return url;
};
