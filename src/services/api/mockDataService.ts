/**
 * Generates mock search results for use when API is not available
 * @param query The search query
 */
export const getMockSearchResults = (query: string) => {
  // Формируем название для главного демо-товара на основе запроса
  const mainProductName = query ? 
    `${query} - демонстрационный товар` : 
    'Демонстрационный товар';
  
  // Создаем случайную цену в пределах от 10 до 1000
  const randomPrice = () => (Math.floor(Math.random() * 990) + 10).toFixed(2);
  
  // Выбираем валюту случайным образом
  const currencies = ['EUR', 'USD', 'GBP'];
  const randomCurrency = () => currencies[Math.floor(Math.random() * currencies.length)];
  
  // Преобразуем запрос в формат URL
  const slugifiedQuery = query.toLowerCase().replace(/\s+/g, '-');
  
  // Создаем текстовое описание для товара
  const description = query ? 
    `Демонстрационный товар ${query} для проверки работы приложения. Данные генерируются локально.` :
    'Демонстрационный товар для проверки работы приложения. Данные генерируются локально.';
  
  // Статические изображения для демо-товаров
  const demoImages = [
    `https://dummyimage.com/300x300/e3e3e3/333333&text=${encodeURIComponent(query)}`,
    'https://dummyimage.com/300x300/e3e3e3/333333&text=Demo+1',
    'https://dummyimage.com/300x300/e3e3e3/333333&text=Demo+2',
  ];
  
  // Генерируем уникальные ID и информацию о магазинах
  return {
    products: [
      {
        id: `demo-${Date.now()}-1`,
        title: mainProductName,
        price: `${randomPrice()} ${randomCurrency()}`,
        currency: randomCurrency(),
        image: demoImages[0],
        link: `https://example.com/product-query`,
        rating: 4.7,
        source: 'Search Demo',
        subtitle: 'Демо товар',
        description: description,
        availability: 'В наличии',
        brand: query.split(' ')[0] || 'Demo Brand',
        specifications: {
          'Категория': 'Демонстрация',
          'Тип': 'Демонстрационный товар'
        }
      },
      {
        id: `demo-${Date.now()}-2`,
        title: 'Демонстрационный товар 1',
        price: `${randomPrice()} ${randomCurrency()}`,
        currency: randomCurrency(),
        image: demoImages[1],
        link: 'https://example.com/product1',
        rating: 4.2,
        source: 'Demo Shop',
        subtitle: 'Демо',
        description: 'Демонстрационные данные для тестирования интерфейса.',
        availability: 'Предзаказ'
      },
      {
        id: `demo-${Date.now()}-3`,
        title: 'Демонстрационный товар 2',
        price: `${randomPrice()} ${randomCurrency()}`,
        currency: randomCurrency(),
        image: demoImages[2],
        link: 'https://example.com/product2',
        rating: 3.8,
        source: 'Demo Market',
        subtitle: 'Демо',
        description: 'Тестовые данные, сгенерированные системой.'
      }
    ],
    total_results: 3,
    total_pages: 1,
    page: 1
  };
};
