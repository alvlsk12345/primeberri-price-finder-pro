
// Добавим экспорт parseResponse для обратной совместимости
export const parseResponse = (data: any, originalQuery: string) => {
  // Здесь должна быть ваша логика парсинга
  // Для совместимости с существующим кодом, будем просто возвращать данные
  return data;
};

// При необходимости можете добавить свою реализацию parseApiResponse
export const parseApiResponse = (data: any, originalQuery: string) => {
  // Аналогичная логика
  return data;
};
