
export interface Brand {
  brand?: string;
  name?: string;
  product?: string;
  description?: string;
  products?: string[];
}

export interface BrandResponse {
  products?: Brand[];
}

// Интерфейс для предложений бренда
export interface BrandSuggestion {
  brand: string;
  product: string;
  description: string;
}
