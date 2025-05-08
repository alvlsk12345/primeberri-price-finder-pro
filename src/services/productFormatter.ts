
import { Product } from './types';
import { processProductImage } from './imageProcessor';
import { toast } from "@/components/ui/sonner";

// Вспомогательная функция для обработки данных о товарах из Zylalabs API
export const processZylalabsProductsData = (products: any[]): Product[] => {
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
    
    // Обрабатываем изображение товара
    const imageUrl = processProductImage(product.image, index);
    
    // Если изображение не прошло валидацию, пропускаем товар
    if (!imageUrl) {
      console.log('Пропускаем товар из-за невалидного URL изображения');
      invalidImageCounter++;
      return null;
    }
    
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
