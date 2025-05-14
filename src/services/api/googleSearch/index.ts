
// Реэкспортируем все необходимые функции и конфигурации
export * from './config';
export * from './imageSearch';
export * from './validator';

// Создаем и экспортируем функцию поиска по умолчанию
export const googleSearch = async (query: string) => {
  console.log('Запрос к Google Search API:', query);
  return [];
};

// Экспорт по умолчанию для совместимости
export default {
  googleSearch
};
