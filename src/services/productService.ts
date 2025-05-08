
import { fetchFromOpenAI } from './api/openaiService';
import { getUniqueImageUrl, getFallbackImage, isValidImageUrl } from './imageService';
import { Product } from './types';
import { toast } from "@/components/ui/sonner";

// Функция для использования OpenAI API для поиска товаров
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    // Получаем данные от OpenAI API
    const content = await fetchFromOpenAI(query);
    
    // Парсим результаты из ответа OpenAI
    try {
      // Находим и извлекаем JSON из ответа
      const jsonStartIndex = content.indexOf('[');
      const jsonEndIndex = content.lastIndexOf(']') + 1;
      const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);
      let products = JSON.parse(jsonContent);
      
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
          imageUrl = getFallbackImage(index);
        }
        
        // Извлекаем валюту из цены
        const priceString = product.price || "0 €";
        const currencyMatch = priceString.match(/[£$€]/);
        const currency = currencyMatch ? currencyMatch[0] : '€';
        
        return {
          id: product.id || `${Date.now()}-${index}`,
          title: product.title || `Товар ${index + 1}`,
          subtitle: product.subtitle || "Популярный",
          price: product.price || "0 €",
          currency: currency,
          image: imageUrl,
          link: product.link || "#",
          rating: parseFloat(product.rating) || (4 + Math.random()).toFixed(1),
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
