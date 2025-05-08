
import { searchProductsViaZylalabs } from './api/zylalabsService';
import { isValidImageUrl, getUniqueImageUrl } from './imageService';
import { Product } from './types';
import { toast } from "@/components/ui/sonner";

// Функция для поиска товаров
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    console.log('Начинаем поиск товаров по запросу:', query);
    
    // Получаем данные от Zylalabs API вместо OpenAI
    const products = await searchProductsViaZylalabs(query);
    console.log('Ответ от API получен:', products);
    
    // Обрабатываем данные о товарах
    return processZylalabsProductsData(products);
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    toast.error('Произошла ошибка при поиске товаров');
    return [];
  }
};

// Вспомогательная функция для обработки данных о товарах из Zylalabs API
const processZylalabsProductsData = (products: any[]): Product[] => {
  if (!Array.isArray(products) || products.length === 0) {
    console.log('Пустой массив продуктов или некорректный формат');
    toast.info('По вашему запросу ничего не найдено');
    return [];
  }
  
  console.log(`Обработка ${products.length} продуктов`);
  let invalidImageCounter = 0;

  // Проверяем и корректируем данные о товарах
  const validProducts = products.slice(0, 3).map((product: any, index: number) => {
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
    
    // Определяем цену и валюту
    const price = product.price || "0";
    const currency = product.currency || "$";
    const priceString = `${price} ${currency}`;
    
    // Готовим рейтинг
    const rating = product.rating ? parseFloat(product.rating) : 4.0;
    
    return {
      id: product.id || `${Date.now()}-${index}`,
      title: product.title || `Товар ${index + 1}`,
      subtitle: product.condition || "Популярный",
      price: priceString,
      currency: currency,
      image: imageUrl,
      link: product.link || "#",
      rating: rating,
      source: product.source || product.store || 'Интернет-магазин'
    };
  }).filter(product => product !== null); // Фильтруем null продукты
  
  console.log(`Валидных товаров: ${validProducts.length} из ${products.length}`);
  
  // Показываем информацию, если были выявлены проблемы с изображениями
  if (invalidImageCounter > 0) {
    const validCount = validProducts.length;
    const totalCount = Math.min(products.length, 3);
    
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
