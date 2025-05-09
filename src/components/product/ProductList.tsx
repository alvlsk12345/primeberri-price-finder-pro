
import React from 'react';
import { Product } from "@/services/types";
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, selectedProduct, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.slice(0, 9).map((product) => (
        <div key={product.id} className="flex h-full">
          <ProductCard
            product={product}
            isSelected={selectedProduct?.id === product.id}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
};
