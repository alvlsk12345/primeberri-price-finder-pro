
// Расширенный список доменов и паттернов поисковых систем
const searchEngines = [
  'google.com',
  'google.co.uk',
  'google.ru',
  'google.',
  'yandex.ru',
  'bing.com',
  'shopping.google',
  'search?',
  'ibp=oshop',
  'q=',
  'query=',
  'shopping.com',
  'marketplace.',
  'search/results',
  'catalogid:',
  'gpcid:',
  'prds='
];

// Улучшенная функция для проверки, является ли ссылка поисковой
export const isSearchEngineLink = (link: string): boolean => {
  // Если ссылка отсутствует, считаем её поисковой для безопасности
  if (!link || link === 'undefined' || link.length < 10) return true;
  
  // Преобразуем в нижний регистр для более надежного сравнения
  const lowerCaseLink = link.toLowerCase();
  
  // Проверяем на общие паттерны поисковых ссылок
  if (lowerCaseLink.includes('/search?')) return true;
  if (lowerCaseLink.includes('query=')) return true;
  if (lowerCaseLink.includes('q=')) return true;
  if (lowerCaseLink.includes('ibp=oshop')) return true;
  if (lowerCaseLink.includes('prds=')) return true;
  if (lowerCaseLink.includes('catalogid:')) return true;
  if (lowerCaseLink.includes('gpcid:')) return true;
  if (lowerCaseLink.includes('headlineOfferId')) return true;
  if (lowerCaseLink.includes('imageDocid:')) return true;
  
  // Проверяем на конкретные домены поисковиков
  return searchEngines.some(engine => lowerCaseLink.includes(engine));
};
