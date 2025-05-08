
import { fetchFromOpenAI } from './api/openaiService';
import { getUniqueImageUrl, getFallbackImage } from './imageService';
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
        // Добавляем уникальную ссылку на изображение
        let imageUrl = getUniqueImageUrl(product.image || "", index);
        
        // Если изображения нет или оно некорректное, используем изображения с Unsplash
        if (!imageUrl || imageUrl.includes("placeholder") || !imageUrl.startsWith("http")) {
          imageUrl = getFallbackImage(index);
        }
        
        return {
          id: product.id || `${Date.now()}-${index}`,
          name: product.name || `Товар ${index + 1}`,
          price: Number(product.price) || 100 + (index * 50),
          currency: product.currency || 'EUR',
          image: imageUrl,
          store: product.store || 'Интернет-магазин'
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
        name: `${query} - Товар (резервные данные)`,
        price: 250,
        currency: 'EUR',
        image: getFallbackImage(0),
        store: 'Amazon'
      },
      {
        id: `${Date.now()}-2`,
        name: `${query} - Аналогичный товар (резервные данные)`,
        price: 180,
        currency: 'EUR',
        image: getFallbackImage(1),
        store: 'eBay'
      }
    ];
  }
};

// Экспортируем функции из других сервисных модулей для обратной совместимости
export { getExchangeRate } from './exchangeService';
export { getProductLink } from './urlService';
export type { Product } from './types';
