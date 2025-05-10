
import { processProductImage } from "../imageProcessor";
import { searchProductImageGoogle } from "./googleSearchService";
import { fetchWithProxy } from "./proxyService";

/**
 * Функция для поиска изображения по бренду и продукту
 * @param brand Название бренда
 * @param product Название продукта
 * @param index Индекс для уникальности изображения
 * @returns URL изображения или пустую строку в случае ошибки
 */
export const searchProductImage = async (brand: string, product: string, index: number = 0): Promise<string> => {
  try {
    console.log(`Поиск изображения для: ${brand} ${product}`);
    
    // Используем Google CSE через прокси
    const imageUrl = await searchProductImageGoogle(brand, product, index);
    
    if (imageUrl) {
      console.log(`Найдено изображение: ${imageUrl}`);
      // Обрабатываем URL изображения через наш обновленный processProductImage
      return processProductImage(imageUrl, index);
    }
    
    console.log(`Изображение не найдено для: ${brand} ${product}`);
    return '';
  } catch (error) {
    console.error('Ошибка при поиске изображения:', error);
    return '';
  }
};

/**
 * Тестовый запрос через прокси для проверки его работы
 */
export const testProxyConnection = async (): Promise<{ success: boolean, message: string }> => {
  try {
    console.log('Тестирование прокси-соединения...');
    
    const testResponse = await fetchWithProxy('https://api.ipify.org?format=json');
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      return { 
        success: true, 
        message: `Прокси работает успешно. IP: ${data.ip}` 
      };
    }
    
    return { 
      success: false, 
      message: `Не удалось подключиться к прокси. Статус: ${testResponse.status}` 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: `Ошибка при проверке прокси: ${error.message}` 
    };
  }
};
