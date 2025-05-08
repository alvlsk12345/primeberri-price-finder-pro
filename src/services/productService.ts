import { toast } from "@/components/ui/sonner";

export type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
};

// Функция для получения API ключа из localStorage
const getApiKey = (): string => {
  return localStorage.getItem('openai_api_key') || '';
};

// Функция для использования OpenAI API для поиска товаров
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    // Получаем API ключ из localStorage
    const apiKey = getApiKey();
    
    // Проверка на корректность ключа API
    if (!apiKey) {
      toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    // Создаем запрос к OpenAI API для генерации результатов поиска
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",  // Используем более доступную модель
        messages: [
          {
            role: "system",
            content: "Ты - помощник для поиска товаров. Генерируй релевантные результаты поиска в формате JSON на основе запроса пользователя. Результаты должны включать 3-5 товаров с названием, ценой в евро, магазином и ссылкой на реальное изображение товара."
          },
          {
            role: "user",
            content: `Найди товары по запросу: ${query}. Верни только JSON без дополнительного текста, в формате: [{"id": "уникальный_id", "name": "название товара", "price": цена_в_числовом_формате, "currency": "EUR", "image": "ссылка_на_изображение", "store": "название_магазина"}]. Для изображений используй публичные URL изображений товаров.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      const errorMessage = errorData.error?.message || 'Неизвестная ошибка';
      
      // Проверяем специфические ошибки и даем понятные сообщения
      if (errorMessage.includes("quota")) {
        toast.error("Превышен лимит запросов API. Проверьте ваш тарифный план OpenAI.");
        throw new Error("Превышен лимит запросов OpenAI API");
      } else if (errorMessage.includes("invalid")) {
        toast.error("Недействительный API ключ. Пожалуйста, проверьте его в настройках.");
        throw new Error("Недействительный API ключ");
      } else {
        toast.error(`Ошибка API: ${errorMessage}`);
        throw new Error(`Ошибка OpenAI API: ${errorMessage}`);
      }
    }

    const data = await openaiResponse.json();
    const content = data.choices[0]?.message?.content;

    // Парсим результаты из ответа OpenAI
    try {
      // Находим и извлекаем JSON из ответа
      const jsonStartIndex = content.indexOf('[');
      const jsonEndIndex = content.lastIndexOf(']') + 1;
      const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);
      let products = JSON.parse(jsonContent);
      
      // Проверяем и корректируем данные о товарах
      const validProducts = products.map((product: any, index: number) => {
        // Проверка и исправление ссылки на изображение
        let imageUrl = product.image || "";
        
        // Если изображения нет или оно некорректное, используем изображения с Unsplash
        if (!imageUrl || imageUrl.includes("placeholder") || !imageUrl.startsWith("http")) {
          const unsplashImages = [
            "https://images.unsplash.com/photo-1604525843809-cbba713a792b", // технологии
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff", // обувь
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30", // часы
            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f", // камера
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"  // наушники
          ];
          imageUrl = unsplashImages[index % unsplashImages.length];
        }
        
        return {
          id: product.id || `${index + 1}`,
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
        id: '1',
        name: `${query} - Товар (резервные данные)`,
        price: 250,
        currency: 'EUR',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        store: 'Amazon'
      },
      {
        id: '2',
        name: `${query} - Аналогичный товар (резервные данные)`,
        price: 180,
        currency: 'EUR',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        store: 'eBay'
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

// Обновляем функцию для получения реальной ссылки на страницу товара
export const getProductLink = (product: Product): string => {
  // Карта реальных доменов магазинов
  const storeMap: {[key: string]: string} = {
    'Amazon': 'amazon.com',
    'eBay': 'ebay.com',
    'Zalando': 'zalando.eu',
    'ASOS': 'asos.com',
    'JD Sports': 'jdsports.com',
    'Nike Store': 'nike.com',
    'Foot Locker': 'footlocker.eu',
    'Adidas': 'adidas.com',
    'H&M': 'hm.com',
    'Zara': 'zara.com',
    'Sportisimo': 'sportisimo.eu',
    'Интернет-магазин': 'shop.example.com'
  };

  // Определяем домен магазина или используем запасной вариант
  const domain = storeMap[product.store] || 'shop.example.com';
  
  // Формируем URL с правильными параметрами
  // Например: https://amazon.com/dp/B09X123456 для Amazon
  if (domain === 'amazon.com') {
    return `https://${domain}/dp/${product.id}`;
  } else if (domain === 'ebay.com') {
    return `https://${domain}/itm/${product.id}`;
  } else {
    // Для других магазинов используем стандартный формат
    const productSlug = product.name.toLowerCase().replace(/[^a-zа-яё0-9]/g, '-').replace(/-+/g, '-');
    return `https://${domain}/product/${productSlug}-${product.id}`;
  }
};
