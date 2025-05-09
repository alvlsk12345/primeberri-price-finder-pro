
import { isSearchEngineLink } from './searchEngineDetector';

// Улучшенная функция для извлечения идентификатора продукта из ссылки или генерации кода товара
export const extractProductId = (link: string | undefined, fallbackId: string): string => {
  // Проверяем наличие ссылки
  if (!link || isSearchEngineLink(link)) {
    return fallbackId; // Используем fallbackId для поисковых ссылок или отсутствующих ссылок
  }
  
  // Пытаемся извлечь идентификатор магазина из поисковой ссылки
  if (link.includes('google.com') && link.includes('mid:')) {
    const midMatch = link.match(/mid:([0-9]+)/);
    if (midMatch && midMatch[1]) {
      return midMatch[1]; // Возвращаем найденный ID из ссылки Google
    }
  }

  // Извлечение из ссылок MandM Direct
  const mandmPattern = /([A-Z]{2}[0-9]{5})/i;
  const mandmMatch = link.match(mandmPattern);
  if (mandmMatch && mandmMatch[1]) {
    return mandmMatch[1]; // Возвращаем код продукта, например PU35213
  }
  
  // Извлечение из ссылок Argos
  const argosPattern = /product\/([0-9]{7,9})\//i;
  const argosMatch = link.match(argosPattern);
  if (argosMatch && argosMatch[1]) {
    return argosMatch[1];
  }

  // Adidas: /fussballliebe-training-ball/IN9366.html
  const adidasPattern = /\/([^\/]+)\/([A-Z0-9]{6})\.html/;
  const adidasMatch = link.match(adidasPattern);
  if (adidasMatch && adidasMatch[2]) {
    return adidasMatch[2]; // Возвращаем код продукта, например IN9366
  }
  
  // Nike: /t/air-force-1-07-shoes-WrLlWX/CW2288-111
  const nikePattern = /\/t\/[^\/]+\/([A-Z0-9]+-[0-9]+)/;
  const nikeMatch = link.match(nikePattern);
  if (nikeMatch && nikeMatch[1]) {
    return nikeMatch[1];
  }
  
  // Amazon: /dp/B07PXGQC1Q/
  const amazonPattern = /\/dp\/([A-Z0-9]{10})/;
  const amazonMatch = link.match(amazonPattern);
  if (amazonMatch && amazonMatch[1]) {
    return amazonMatch[1];
  }
  
  // Zara: /item/9598/536/251
  const zaraPattern = /\/([0-9]+)\/([0-9]+)\/([0-9]+)/;
  const zaraMatch = link.match(zaraPattern);
  if (zaraMatch && zaraMatch[1]) {
    return `${zaraMatch[1]}${zaraMatch[2]}${zaraMatch[3]}`;
  }
  
  // Общие шаблоны для других магазинов
  const patterns = [
    /\/([A-Za-z0-9]{10})\/?(\?|$)/, // Amazon ASIN
    /-([A-Za-z0-9]{7,12})\.html/, // Nike/Zalando
    /\/([A-Za-z0-9]{9,15})$/, // eBay
    /p\/([A-Za-z0-9-]{5,20})$/ // Другие магазины
  ];
  
  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return fallbackId; // Используем fallbackId, если не удалось извлечь ID
};
