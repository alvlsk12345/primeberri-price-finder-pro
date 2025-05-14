import { BrandSuggestion } from "@/services/types";

// Helper function to safely parse JSON
const safeJsonParse = (str: string): any => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("Error parsing JSON", e);
    return null;
  }
};

// Function to extract JSON array from string content
const extractJsonArray = (content: string): any[] | null => {
  const jsonRegex = /\[\s*\{.*?\}(?:\s*,\s*\{.*?\})*\s*\]/gs;
  const match = content.match(jsonRegex);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      console.error("Error parsing JSON array", e);
      return null;
    }
  }
  return null;
};

// Function to extract JSON object from string content
const extractJsonObject = (content: string): any | null => {
  const jsonRegex = /\{.*?\}/gs;
  const match = content.match(jsonRegex);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      console.error("Error parsing JSON object", e);
      return null;
    }
  }
  return null;
};

// Function to validate BrandSuggestion object
const isValidBrandSuggestion = (item: any): item is BrandSuggestion => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.brand === 'string' &&
    typeof item.product === 'string' &&
    typeof item.description === 'string'
  );
};

// Исправленная функция для обработки результата в JSON
export const processBrandSuggestions = (content: string): BrandSuggestion[] => {
  let products: any[] | null = [];

  // Сначала пытаемся извлечь JSON object
  let jsonObject = extractJsonObject(content);

  if (jsonObject && jsonObject.products && Array.isArray(jsonObject.products)) {
    products = jsonObject.products;
  } else {
    // Если не получилось, пытаемся извлечь JSON array
    products = extractJsonArray(content);
  }

  if (!products || products.length === 0) {
    console.warn("Не удалось получить предложения брендов из ответа, использую заглушки");
    return [
      {
        brand: "Apple",
        product: "AirPods Pro",
        description: "Наушники с активным шумоподавлением и адаптивным звуком"
      },
      {
        brand: "Samsung",
        product: "Galaxy Watch",
        description: "Умные часы для фитнеса и здоровья"
      },
      {
        brand: "Sony",
        product: "WH-1000XM4",
        description: "Беспроводные наушники с шумоподавлением"
      },
      {
        brand: "Anker",
        product: "PowerCore",
        description: "Портативное зарядное устройство"
      },
      {
        brand: "Logitech",
        product: "MX Master",
        description: "Беспроводная мышь для профессионалов"
      },
      {
        brand: "DJI",
        product: "Mavic Air",
        description: "Компактный дрон с камерой 4K"
      }
    ];
  }

  // Фильтруем и проверяем элементы массива
  const validProducts: BrandSuggestion[] = products
    .filter(isValidBrandSuggestion)
    .map(item => ({
      brand: item.brand,
      product: item.product,
      description: item.description
    }));

  return validProducts;
};

// Функция для обработки ошибок при парсинге
export const handleParsingError = (error: any, content: string) => {
  console.error("Ошибка при обработке ответа OpenAI:", error);
  console.log("Содержимое ответа:", content);
  return [];
};
