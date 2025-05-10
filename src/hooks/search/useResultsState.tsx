
import { useState } from 'react';
import { Product } from "@/services/types";

export function useResultsState() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allSearchResults, setAllSearchResults] = useState<Product[]>([]); // Новое состояние для хранения всех нефильтрованных результатов
  const [cachedResults, setCachedResults] = useState<{[page: number]: Product[]}>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  const [apiInfo, setApiInfo] = useState<Record<string, string> | undefined>(undefined);
  
  return {
    searchResults,
    setSearchResults,
    allSearchResults,
    setAllSearchResults,
    cachedResults,
    setCachedResults,
    selectedProduct,
    setSelectedProduct,
    isUsingDemoData,
    setIsUsingDemoData,
    apiInfo,
    setApiInfo,
  };
}
