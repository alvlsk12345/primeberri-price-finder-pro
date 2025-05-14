
import { BrandSuggestion } from "@/services/types";
import { callOpenAI } from "../apiClient";
import { toast } from "@/components/ui/use-toast";

// Вспомогательная функция для создания мок-данных для предложений брендов
const createMockBrandSuggestions = (count: number = 6): BrandSuggestion[] => {
  const suggestions: BrandSuggestion[] = [];
  
  const brands = ['Apple', 'Samsung', 'Sony', 'Bose', 'JBL', 'Xiaomi', 'Huawei', 'Anker'];
  const products = ['Наушники', 'Смартфон', 'Умные часы', 'Колонка', 'Фитнес-трекер', 'Зарядное устройство'];
  
  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    
    suggestions.push({
      brand,
      product: `${brand} ${product} ${Math.floor(Math.random() * 100)}`,
      description: `Качественный ${product.toLowerCase()} от бренда ${brand} с отличными характеристиками и надежной работой.`
    });
  }
  
  return suggestions;
};

// Вспомогательная функция для парсинга ответа API
const parseBrandApiResponse = (response: string): BrandSuggestion[] => {
  try {
    const data = JSON.parse(response);
    if (Array.isArray(data.products)) {
      return data.products;
    } else {
      console.error("Некорректный формат данных в ответе API:", data);
      return [];
    }
  } catch (error) {
    console.error("Ошибка при парсинге ответа API:", error);
    return [];
  }
};

// Функция для получения предложений брендов
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Проверяем, что описание не пустое
    if (!description || description.trim().length < 3) {
      toast.error("Описание товара должно содержать минимум 3 символа");
      return [];
    }
    
    console.log("Запрос предложений брендов для описания:", description);
    
    // В демо-режиме возвращаем мок-данные
    if (process.env.NODE_ENV === 'development') {
      console.log("Используем мок-данные для предложений брендов");
      const mockSuggestions = createMockBrandSuggestions(6);
      return mockSuggestions;
    }
    
    // Здесь будет реальный запрос к API
    toast.error("Функция получения предложений брендов временно недоступна");
    return [];
  } catch (error) {
    console.error("Ошибка при получении предложений брендов:", error);
    toast.error(`Ошибка при получении предложений брендов: ${error.message || 'Неизвестная ошибка'}`);
    return [];
  }
};
