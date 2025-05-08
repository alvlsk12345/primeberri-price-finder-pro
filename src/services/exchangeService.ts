
import { toast } from "@/components/ui/sonner";

// Добавляем функцию получения курсов валют
export const getExchangeRate = async (currency: string): Promise<number> => {
  try {
    // В реальном приложении здесь будет запрос к API курсов валют
    // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
    // if (!response.ok) throw new Error('Не удалось получить курс валюты');
    // const data = await response.json();
    // return data.rates.RUB;
    
    // Пока используем заглушку для демонстрации
    return new Promise((resolve) => {
      setTimeout(() => {
        // Примерные курсы валют к рублю
        const rates = {
          'EUR': 100,
          'USD': 90,
          'GBP': 115
        };
        
        resolve(rates[currency as keyof typeof rates] || 100);
      }, 500);
    });
  } catch (error) {
    console.error('Ошибка при получении курса валют:', error);
    toast.error('Не удалось получить актуальный курс валюты');
    return 100; // Дефолтный курс на случай ошибки
  }
};
