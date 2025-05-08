
import { fetchFromOpenAI } from './api/openaiService';
import { getUniqueImageUrl, getFallbackImage, isValidImageUrl } from './imageService';
import { Product } from './types';
import { toast } from "@/components/ui/sonner";

// Функция для использования OpenAI API для поиска товаров
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    // Получаем данные от OpenAI API
    const content = await fetchFromOpenAI(query);
    
    if (!content) {
      toast.error('Не удалось получить результаты поиска');
      throw new Error('Пустой ответ от OpenAI API');
    }
    
    console.log('Получен ответ от OpenAI:', content);
    
    // Парсим результаты из ответа OpenAI
    try {
      // Находим и извлекаем JSON из ответа
      const jsonStartIndex = content.indexOf('[');
      const jsonEndIndex = content.lastIndexOf(']') + 1;
      
      if (jsonStartIndex === -1 || jsonEndIndex === 0) {
        toast.error('Не удалось найти JSON данные в ответе');
        throw new Error('Некорректный формат ответа OpenAI');
      }
      
      const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);
      console.log('Извлеченный JSON:', jsonContent);
      
      let products = JSON.parse(jsonContent);
      
      if (!Array.isArray(products) || products.length === 0) {
        toast.info('По вашему запросу ничего не найдено');
        return [];
      }
      
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
        
        // Добавляем уникальный параметр к URL
        imageUrl = getUniqueImageUrl(imageUrl, index);
        
        // Проверяем, валидный ли URL изображения
        if (!isValidImageUrl(imageUrl)) {
          console.log(`Невалидный URL изображения: ${imageUrl}, используем запасной вариант`);
          imageUrl = getFallbackImage(index);
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
      
      return validProducts;
    } catch (parseError) {
      console.error('Ошибка при парсинге результатов OpenAI:', parseError, content);
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

// Экспортируем функции из других сервисных модулей для обратной совместимости
export { getExchangeRate } from './exchangeService';
export { getProductLink } from './urlService';
export type { Product } from './types';
