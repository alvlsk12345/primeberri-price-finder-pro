
// Функция для обработки ответа от OpenAI API
export const processApiResponse = (content: any, responseFormat: "json_object" | "text" = "text"): any => {
  if (!content) {
    throw new Error('Пустой ответ от API');
  }

  // Обработка ответа в зависимости от запрошенного формата
  if (responseFormat === "json_object") {
    try {
      // Если ответ - это уже объект, просто возвращаем его
      if (typeof content === 'object') {
        return content;
      }
      
      // Удаляем markdown символы, если они есть
      const cleanedContent = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      
      console.log('Очищенный контент для парсинга JSON:', cleanedContent.substring(0, 100) + '...');
      
      // Парсим JSON
      const parsedJson = JSON.parse(cleanedContent);
      console.log('Успешно распарсен JSON, тип:', Array.isArray(parsedJson) ? 'массив' : typeof parsedJson);
      return parsedJson;
    } catch (parseError) {
      console.error('Ошибка при парсинге JSON ответа:', parseError);
      console.log('Контент, который не удалось распарсить:', content);
      // Возвращаем сырой контент для дальнейшей обработки
      return content;
    }
  } else {
    // Для текстового формата просто возвращаем контент
    return content;
  }
};

// Функция для создания имитационных данных о товарах на основе запроса
export function createMockProductsFromQuery(query: string): any[] {
  const normalizedQuery = query.toLowerCase();
  
  // Базовые демо-данные о товарах
  return [
    {
      title: `${normalizedQuery.charAt(0).toUpperCase() + normalizedQuery.slice(1)} Premium`,
      subtitle: "Новинка",
      price: "99.95 €",
      image: "https://placehold.co/600x400?text=Product+Image",
      link: "https://example.com/product1",
      rating: 4.8,
      source: "Demo Shop"
    },
    {
      title: `${normalizedQuery.charAt(0).toUpperCase() + normalizedQuery.slice(1)} Classic`,
      subtitle: "Хит",
      price: "79.99 €",
      image: "https://placehold.co/600x400?text=Product+Image",
      link: "https://example.com/product2",
      rating: 4.5,
      source: "Demo Shop"
    },
    {
      title: `${normalizedQuery.charAt(0).toUpperCase() + normalizedQuery.slice(1)} Budget`,
      subtitle: "Выгода",
      price: "49.99 €",
      image: "https://placehold.co/600x400?text=Product+Image",
      link: "https://example.com/product3",
      rating: 4.2,
      source: "Demo Shop"
    }
  ];
}
