
import { Product } from "@/services/types";

type ProductSelectionProps = {
  setSelectedProduct: (product: Product | null) => void;
};

export function useProductSelectionActions({
  setSelectedProduct
}: ProductSelectionProps) {
  // Обработчик выбора продукта
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };
  
  return {
    handleProductSelect
  };
}
