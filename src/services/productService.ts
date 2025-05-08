import { toast } from "@/components/ui/sonner";

export type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
};

// Функция для использования OpenAI API для поиска товаров
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    // Создаем запрос к OpenAI API для генерации результатов поиска
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('openai_api_key')}` // Получаем ключ из localStorage
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Ты - помощник для поиска товаров. Генерируй релевантные результаты поиска в формате JSON на основе запроса пользователя. Результаты должны включать 3-5 товаров с названием, ценой в евро, магазином и ссылкой на изображение заглушки."
          },
          {
            role: "user",
            content: `Найди товары по запросу: ${query}. Верни только JSON без дополнительного текста, в формате: [{"id": "уникальный_id", "name": "название товара", "price": цена_в_числовом_формате, "currency": "EUR", "image": "https://via.placeholder.com/150", "store": "название_магазина"}]`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`Ошибка OpenAI API: ${errorData.error?.message || 'Неизвестная ошибка'}`);
    }

    const data = await openaiResponse.json();
    const content = data.choices[0]?.message?.content;

    // Парсим результаты из ответа OpenAI
    try {
      const jsonStartIndex = content.indexOf('[');
      const jsonEndIndex = content.lastIndexOf(']') + 1;
      const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);
      const products = JSON.parse(jsonContent);
      
      // Проверяем валидность данных
      const validProducts = products.map((product: any, index: number) => ({
        id: product.id || `${index + 1}`,
        name: product.name || `Товар ${index + 1}`,
        price: Number(product.price) || 100 + (index * 50),
        currency: product.currency || 'EUR',
        image: product.image || 'https://via.placeholder.com/150',
        store: product.store || 'Интернет-магазин'
      }));
      
      return validProducts;
    } catch (parseError) {
      console.error('Ошибка при парсинге результатов OpenAI:', parseError, content);
      throw new Error('Не удалось обработать результаты поиска');
    }
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    toast.error('Произошла ошибка при поиске товаров. Проверьте API ключ и соединение.');
    
    // В случае ошибки возвращаем резервные данные
    return [
      {
        id: '1',
        name: `${query} - Товар (резервные данные)`,
        price: 250,
        currency: 'EUR',
        image: 'https://via.placeholder.com/150',
        store: 'Интернет-магазин'
      },
      {
        id: '2',
        name: `${query} - Аналогичный товар (резервные данные)`,
        price: 180,
        currency: 'EUR',
        image: 'https://via.placeholder.com/150',
        store: 'Online Shop'
      }
    ];
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
