
export interface Brand {
  brand?: string;
  name?: string;
  product?: string;
  description?: string;
  products?: string[];
  logo?: string;
  imageUrl?: string;
}

export interface BrandResponse {
  products?: Brand[];
}
