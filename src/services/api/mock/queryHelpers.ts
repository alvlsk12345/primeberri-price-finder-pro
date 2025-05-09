
/**
 * Список запросов, для которых нужно улучшенное создание товаров
 */
export const SPECIAL_QUERIES = ['hugo boss', 'пиджак', 'jacket', 'suit', 'костюм', 'boss'];

/**
 * Проверяет, соответствует ли запрос определенным ключевым словам
 */
export const matchesKeywords = (query: string, keywords: string[]): boolean => {
  const lowerQuery = query.toLowerCase();
  return keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
};

/**
 * Генерирует дополнительные товары Hugo Boss для запросов, связанных с Hugo Boss
 */
export const generateHugoBossProducts = (query: string) => {
  return [
    {
      id: 'hugo-boss-1',
      title: `[ДЕМО] Hugo Boss ${query.includes('пиджак') ? 'пиджак' : 'jacket'} Premium`,
      subtitle: 'Германия',
      price: '549.99 €',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&h=300',
      link: 'https://hugoboss.com/product1',
      rating: 4.8,
      source: 'Hugo Boss Official',
      description: 'Премиальный пиджак Hugo Boss из осенней коллекции. Элегантный дизайн, идеальная посадка.',
      availability: 'В наличии',
      brand: 'Hugo Boss',
      country: 'de',
      _numericPrice: 549.99
    },
    {
      id: 'hugo-boss-2',
      title: `[ДЕМО] Hugo Boss ${query.includes('костюм') ? 'костюм' : 'suit'} Classic`,
      subtitle: 'Германия',
      price: '799.95 €',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1598808503746-f34faeb4bc61?auto=format&fit=crop&w=300&h=300',
      link: 'https://hugoboss.com/product2',
      rating: 4.9,
      source: 'Hugo Boss Official',
      description: 'Классический костюм Hugo Boss. Идеальный выбор для деловых встреч и особых случаев.',
      availability: 'Под заказ: 2-3 дня',
      brand: 'Hugo Boss',
      country: 'de',
      _numericPrice: 799.95
    }
  ];
};
