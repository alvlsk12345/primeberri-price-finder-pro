
// This file now serves as a simplified facade for the refactored API services
import { SearchParams } from "../types";
import { searchProductsViaZylalabs as searchProducts } from "./searchService";

// Re-export the main search function with the same interface as before
// to maintain backward compatibility
export { searchProducts as searchProductsViaZylalabs };
