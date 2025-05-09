
import { Product } from "@/services/types";
import { SortOption } from "@/components/sorting/SortingMenu";

/**
 * Utility function to apply sorting to products array
 */
export const applySorting = (products: Product[], sort: SortOption): Product[] => {
  if (!products || products.length === 0) return products;
  
  const productsToSort = [...products];
  
  switch (sort) {
    case 'price-asc':
      return productsToSort.sort((a, b) => {
        const priceA = (a as any)._numericPrice || 0;
        const priceB = (b as any)._numericPrice || 0;
        return priceA - priceB;
      });
    case 'price-desc':
      return productsToSort.sort((a, b) => {
        const priceA = (a as any)._numericPrice || 0;
        const priceB = (b as any)._numericPrice || 0;
        return priceB - priceA;
      });
    case 'popularity-desc':
      return productsToSort.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      });
    default:
      return productsToSort;
  }
};
