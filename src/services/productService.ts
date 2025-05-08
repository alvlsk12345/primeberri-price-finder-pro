
import { fetchFromOpenAI } from './api/openaiService';
import { isValidImageUrl, getUniqueImageUrl } from './imageService';
import { Product } from './types';
import { toast } from "@/components/ui/sonner";

// Функция для использования OpenAI API для поиска товаров
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    console.log('Начинаем поиск товаров по запросу:', query);
    
    // Получаем данные от OpenAI API
    const response = await fetchFromOpenAI(query);
    console.log('Ответ от OpenAI получен:', response);
    
    // Если ответ содержит продукты напрямую (response_format: { type: "json_object" })
    if (response && typeof response === 'object') {
      // Проверяем наличие продуктов в объекте (может быть в корне или в products)
      if (Array.isArray(response)) {
        console.log('Получен массив продуктов напрямую:', response);
        return processProductsData(response);
      } else if (response.products && Array.isArray(response.products)) {
        console.log('Получен объект с массивом продуктов:', response.products);
        return processProductsData(response.products);
      } else {
        const keys = Object.keys(response);
        console.log('Получен объект с ключами:', keys);
        
        // Пробуем найти массив в объекте, который может содержать товары
        for (const key of keys) {
          if (Array.isArray(response[key]) && response[key].length > 0) {
            console.log(`Найден массив в ключе "${key}":`, response[key]);
            return processProductsData(response[key]);
          }
        }
        
        console.log('Не найден массив продуктов в ответе:', response);
        toast.error('Не удалось найти товары в ответе API');
        return [];
      }
    }
    
    // Если ответ - строка (старый формат)
    if (typeof response === 'string') {
      console.log('Получен ответ от OpenAI (строка):', response);
      
      // Пытаемся удалить markdown если он есть
      const cleanedResponse = response
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
        
      try {
        // Парсим JSON
        const products = JSON.parse(cleanedResponse);
        
        // Проверяем что получили массив
        if (Array.isArray(products)) {
          return processProductsData(products);
        } 
        // Если получили объект с массивом products
        else if (products.products && Array.isArray(products.products)) {
          return processProductsData(products.products);
        }
        // Если формат не соответствует ожидаемому
        else {
          console.error('Неожиданный формат данных:', products);
          toast.error('Неожиданный формат данных от API');
          return [];
        }
      } catch (parseError) {
        console.error('Ошибка при парсинге JSON строки:', parseError);
        
        // Пытаемся найти JSON массив в тексте
        const jsonStartIndex = cleanedResponse.indexOf('[');
        const jsonEndIndex = cleanedResponse.lastIndexOf(']') + 1;
        
        if (jsonStartIndex !== -1 && jsonEndIndex > jsonStartIndex) {
          const jsonContent = cleanedResponse.substring(jsonStartIndex, jsonEndIndex);
          console.log('Извлеченный JSON:', jsonContent);
          
          try {
            const products = JSON.parse(jsonContent);
            if (Array.isArray(products)) {
              return processProductsData(products);
            }
          } catch (e) {
            console.error('Не удалось извлечь JSON из текста:', e);
          }
        }
        
        toast.error('Не удалось обработать результаты поиска');
        return [];
      }
    }
    
    // Если не удалось обработать ответ
    console.error('Неизвестный формат ответа:', response);
    toast.error('Не удалось получить данные о товарах');
    return [];
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    toast.error('Произошла ошибка при поиске товаров');
    return [];
  }
};

// Вспомогательная функция для обработки данных о товарах
const processProductsData = (products: any[]): Product[] => {
  if (!Array.isArray(products) || products.length === 0) {
    console.log('Пустой массив продуктов или некорректный формат');
    toast.info('По вашему запросу ничего не найдено');
    return [];
  }
  
  console.log(`Обработка ${products.length} продуктов`);
  let invalidImageCounter = 0;

  // Проверяем и корректируем данные о товарах
  const validProducts = products.map((product: any, index: number) => {
    if (!product || typeof product !== 'object') {
      console.error('Некорректный товар:', product);
      invalidImageCounter++;
      return null;
    }
    
    // Проверяем обязательные поля
    if (!product.title || !product.image) {
      console.error('Отсутствуют обязательные поля у товара:', product);
      invalidImageCounter++;
      return null;
    }
    
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
  
  console.log(`Валидных товаров: ${validProducts.length} из ${products.length}`);
  
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
