
import { fetchFromOpenAI } from './api/openaiService';
import { isValidImageUrl, getUniqueImageUrl } from './imageService';
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
      return processProductsData(response);
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
      return processProductsData(products);
      
    } catch (parseError) {
      console.error('Ошибка при парсинге результатов OpenAI:', parseError, response);
      toast.error('Не удалось обработать результаты поиска');
      throw new Error('Не удалось обработать результаты поиска');
    }
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    toast.error('Произошла ошибка при поиске товаров');
    // Возвращаем пустой массив вместо резервных данных
    return [];
  }
};

// Вспомогательная функция для обработки данных о товарах
const processProductsData = (products: any[]): Product[] => {
  if (!Array.isArray(products) || products.length === 0) {
    toast.info('По вашему запросу ничего не найдено');
    return [];
  }
  
  let invalidImageCounter = 0;

  // Проверяем и корректируем данные о товарах
  const validProducts = products.map((product: any, index: number) => {
    // Валидируем и форматируем ссылку на изображение
    let imageUrl = product.image || "";
    
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
      console.log(`Невалидный URL изображения: ${imageUrl}, пропускаем товар`);
      invalidImageCounter++;
      // Пропускаем товар с невалидным URL
      return null;
    }
    
    // Добавляем уникальный параметр к URL
    imageUrl = getUniqueImageUrl(imageUrl, index);
    
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
  }).filter(product => product !== null); // Фильтруем null продукты
  
  // Показываем информацию, если были выявлены проблемы с изображениями
  if (invalidImageCounter > 0) {
    const validCount = validProducts.length;
    const totalCount = products.length;
    
    if (validCount === 0) {
      toast.warning('Не удалось найти товары с корректными изображениями');
    } else if (invalidImageCounter > 0) {
      toast.warning(`Найдено ${validCount} из ${totalCount} товаров с корректными изображениями`);
    }
  }
  
  return validProducts;
};

// Экспортируем функции из других сервисных модулей для обратной совместимости
export { getExchangeRate } from './exchangeService';
export { getProductLink } from './urlService';
export type { Product } from './types';
