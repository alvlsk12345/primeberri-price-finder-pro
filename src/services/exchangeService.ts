
import { toast } from "@/components/ui/sonner";

// Добавляем функцию получения курсов валют
export const getExchangeRate = async (currency: string): Promise<number> => {
  try {
    // В реальном приложении здесь будет запрос к API курсов валют
    // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
    // if (!response.ok) throw new Error('Не удалось получить курс валюты');
    // const data = await response.json();
    // return data.rates.RUB;
    
    // Используем заданный курс для рубля согласно требованию
    return new Promise((resolve) => {
      setTimeout(() => {
        if (currency === 'EUR') {
          resolve(105.92); // Указанный курс евро к рублю
        } else {
          // Примерные курсы других валют к рублю
          const rates: { [key: string]: number } = {
            'USD': 95.84,
            'GBP': 122.50
          };
          resolve(rates[currency] || 105.92); // По умолчанию возвращаем курс евро
        }
      }, 100);
    });
  } catch (error) {
    console.error('Ошибка при получении курса валют:', error);
    toast.error('Не удалось получить актуальный курс валюты');
    return 105.92; // Дефолтный курс на случай ошибки (для евро)
  }
};

// Функция для конвертации цены в евро из другой валюты
export const convertToEuro = (price: number, currency: string): number => {
  // Курсы относительно евро
  const rateToEuro: { [key: string]: number } = {
    'EUR': 1,
    'USD': 0.92,
    'GBP': 1.18,
    'RUB': 0.00944 // 1/105.92
  };
  
  return price * (rateToEuro[currency] || 1);
};

// Функция для расчета цены с доставкой в рублях
export const calculateRussianDeliveryPrice = (euroPrice: number): number => {
  // Формула: (цена с сайта * 1,05)*105.92
  return (euroPrice * 1.05) * 105.92;
};
