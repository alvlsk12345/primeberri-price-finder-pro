
import { toast } from "@/components/ui/sonner";

export type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
};

// Здесь мы будем использовать реальный API для поиска товаров
// В этом примере я создаю интерфейс для API, который можно будет заменить на реальный
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    // В реальном приложении здесь будет запрос к API
    // const response = await fetch(`https://api.example.com/search?q=${encodeURIComponent(query)}`);
    // if (!response.ok) throw new Error('Ошибка при поиске товаров');
    // const data = await response.json();
    // return data.products;

    // Пока используем заглушку для демонстрации
    // В будущем здесь будет реальный API-запрос
    
    // Имитируем запрос к API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Имитация результатов поиска на основе запроса
        const mockResults: Product[] = [
          {
            id: '1',
            name: `${query} - Кожаная сумка премиум класса`,
            price: 250,
            currency: 'EUR',
            image: 'https://via.placeholder.com/150',
            store: 'Zalando'
          },
          {
            id: '2',
            name: `${query} - Спортивные кроссовки Nike Air`,
            price: 180,
            currency: 'EUR',
            image: 'https://via.placeholder.com/150',
            store: 'Amazon'
          },
          {
            id: '3',
            name: `${query} - Дизайнерские джинсы Levi's`,
            price: 220,
            currency: 'EUR',
            image: 'https://via.placeholder.com/150',
            store: 'H&M'
          }
        ];
        
        resolve(mockResults);
      }, 1500);
    });
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    toast.error('Произошла ошибка при поиске товаров');
    return [];
  }
};

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
