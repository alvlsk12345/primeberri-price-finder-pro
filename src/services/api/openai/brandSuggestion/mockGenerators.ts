
// Функция для создания имитационных данных о брендах на основе описания
export function createMockBrandSuggestions(description: string): any[] {
  const capitalizedDescription = description.charAt(0).toUpperCase() + description.slice(1);
  
  return [
    {
      brand: "BrandPrime",
      product: `${capitalizedDescription} Pro`,
      description: `Высококачественный ${description} с превосходными характеристиками и стильным дизайном.`,
      imageUrl: `https://placehold.co/600x400?text=BrandPrime+${encodeURIComponent(description)}`
    },
    {
      brand: "EcoStyle",
      product: `Eco${capitalizedDescription}`,
      description: `Экологичный ${description} из переработанных материалов с отличными функциями.`,
      imageUrl: `https://placehold.co/600x400?text=EcoStyle+${encodeURIComponent(description)}`
    },
    {
      brand: "TechSolutions",
      product: `Smart${capitalizedDescription}`,
      description: `Инновационный ${description} с интеллектуальными функциями и современным дизайном.`,
      imageUrl: `https://placehold.co/600x400?text=TechSolutions+${encodeURIComponent(description)}`
    }
  ];
}
