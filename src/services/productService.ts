
import { fetchFromOpenAI } from './api/openaiService';
import { getUniqueImageUrl, getFallbackImage, isValidImageUrl, validateImageTitleMatch } from './imageService';
import { Product } from './types';
import { toast } from "@/components/ui/sonner";

// Функция для использования OpenAI API для поиска товаров
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    // Получаем данные от OpenAI API
    const response = await fetchFromOpenAI(query);
    
    // Проверяем, является ли ответ уже массивом (успешно распарсен JSON в openaiService)
    if (Array.isArray(response)) {
      console.log('Получен ответ от OpenAI (уже распарсен):', response);
      return processProductsData(response, query);
    }
    
    // Если ответ не является массивом, это строка с JSON
    console.log('Получен ответ от OpenAI (строка):', response);
    
    // Парсим результаты из ответа OpenAI
    try {
      // Находим и извлекаем JSON из ответа
      const jsonStartIndex = response.indexOf('[');
      const jsonEndIndex = response.lastIndexOf(']') + 1;
      
      if (jsonStartIndex === -1 || jsonEndIndex === 0) {
        toast.error('Не удалось найти JSON данные в ответе');
        throw new Error('Некорректный формат ответа OpenAI');
      }
      
      const jsonContent = response.substring(jsonStartIndex, jsonEndIndex);
      console.log('Извлеченный JSON:', jsonContent);
      
      let products = JSON.parse(jsonContent);
      return processProductsData(products, query);
      
    } catch (parseError) {
      console.error('Ошибка при парсинге результатов OpenAI:', parseError, response);
      toast.error('Не удалось обработать результаты поиска');
      throw new Error('Не удалось обработать результаты поиска');
    }
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    
    // В случае ошибки возвращаем резервные данные с реальными изображениями
    return [
      {
        id: `${Date.now()}-1`,
        title: `${query} - Товар (резервные данные)`,
        subtitle: "Популярный",
        price: "250 €",
        currency: "€",
        image: getFallbackImage(0),
        link: "#",
        rating: 4.7,
        source: 'Amazon'
      },
      {
        id: `${Date.now()}-2`,
        title: `${query} - Аналогичный товар (резервные данные)`,
        subtitle: "Новинка",
        price: "180 €",
        currency: "€",
        image: getFallbackImage(1),
        link: "#",
        rating: 4.5,
        source: 'eBay'
      }
    ];
  }
};

// Вспомогательная функция для обработки данных о товарах
const processProductsData = (products: any[], searchQuery: string): Product[] => {
  if (!Array.isArray(products) || products.length === 0) {
    toast.info('По вашему запросу ничего не найдено');
    return [];
  }
  
  let invalidImageCounter = 0;
  let mismatchCounter = 0;

  // Проверяем и корректируем данные о товарах
  const validProducts = products.map((product: any, index: number) => {
    // Валидируем и форматируем ссылку на изображение
    let imageUrl = product.image || "";
    let imageChanged = false;
    
    // Убедимся, что imageUrl - строка
    imageUrl = typeof imageUrl === 'string' ? imageUrl : '';
    
    // Форматируем URL изображения
    imageUrl = imageUrl.trim();
    
    // Добавляем протокол, если его нет
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
      imageUrl = `https://${imageUrl}`;
    }
    
    // Преобразуем относительные URL в абсолютные
    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = `https:${imageUrl}`;
    }
    
    // Проверяем, валидный ли URL изображения
    if (!isValidImageUrl(imageUrl)) {
      console.log(`Невалидный URL изображения: ${imageUrl}, используем запасной вариант`);
      imageUrl = getFallbackImage(index);
      imageChanged = true;
      invalidImageCounter++;
    } 
    // Проверяем соответствие изображения названию товара
    else if (!validateImageTitleMatch(imageUrl, product.title)) {
      console.log(`Несоответствие изображения и названия для товара: ${product.title}, URL: ${imageUrl}`);
      
      // Используем запасное изображение при несоответствии
      imageUrl = getFallbackImage(index);
      imageChanged = true;
      mismatchCounter++;
    }
    
    // Если изображение изменилось, не добавляем уникальные параметры
    if (!imageChanged) {
      // Добавляем уникальный параметр к URL
      imageUrl = getUniqueImageUrl(imageUrl, index);
    }
    
    // Извлекаем валюту из цены
    const priceString = product.price || "0 €";
    const currencyMatch = priceString.match(/[£$€]/);
    const currency = currencyMatch ? currencyMatch[0] : '€';
    
    // Обрабатываем рейтинг, гарантируя, что он будет числом
    let rating: number = 4.0;
    
    // Если рейтинг есть и он числовой, используем его
    if (product.rating !== undefined && product.rating !== null) {
      // Сначала преобразуем в строку, затем в число для безопасного парсинга
      const ratingStr = String(product.rating);
      rating = parseFloat(ratingStr) || 4.0;
    }
    
    return {
      id: product.id || `${Date.now()}-${index}`,
      title: product.title || `Товар ${index + 1}`,
      subtitle: product.subtitle || "Популярный",
      price: product.price || "0 €",
      currency: currency,
      image: imageUrl,
      link: product.link || "#",
      rating: rating, // Теперь гарантированно число
      source: product.source || 'Интернет-магазин'
    };
  });
  
  // Показываем информацию, если были выявлены проблемы с изображениями
  if (invalidImageCounter > 0 || mismatchCounter > 0) {
    const totalIssues = invalidImageCounter + mismatchCounter;
    const productsCount = products.length;
    
    if (totalIssues === productsCount) {
      toast.warning(`Для всех товаров использованы запасные изображения из-за проблем с оригинальными`);
    } else {
      toast.warning(`Для ${totalIssues} из ${productsCount} товаров использованы запасные изображения`);
    }
  }
  
  return validProducts;
};

// Экспортируем функции из других сервисных модулей для обратной совместимости
export { getExchangeRate } from './exchangeService';
export { getProductLink } from './urlService';
export type { Product } from './types';
