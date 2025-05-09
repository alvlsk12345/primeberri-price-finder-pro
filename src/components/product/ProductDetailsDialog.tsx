
import React, { useState } from 'react';
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/services/types";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Import our new components
import { ProductDetailsImage } from "./details/ProductDetailsImage";
import { ProductDetailsInfo } from "./details/ProductDetailsInfo";
import { ProductDetailsDescription } from "./details/ProductDetailsDescription";
import { ProductDetailsSpecifications } from "./details/ProductDetailsSpecifications";

interface ProductDetailsDialogProps {
  product: Product;
}

export const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({ product }) => {
  // Состояние для открытия диалога
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const renderProductDetails = () => {
    try {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center justify-center bg-gray-50 p-4 rounded-md">
            <ProductDetailsImage image={product.image} title={product.title} />
          </div>
          
          <ProductDetailsInfo product={product} />
        </div>
      );
    } catch (error) {
      console.error('Ошибка при отображении информации о товаре:', error);
      return (
        <div className="p-4 text-center">
          <p className="text-red-500">Произошла ошибка при загрузке информации о товаре</p>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <Info size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product?.title || "Информация о товаре"}</DialogTitle>
          {product?.subtitle && <DialogDescription>{product.subtitle}</DialogDescription>}
        </DialogHeader>
        
        {renderProductDetails()}
        
        <ProductDetailsDescription 
          description={product.description} 
          isOpen={isOpen} 
        />
        
        <ProductDetailsSpecifications 
          specifications={product.specifications} 
        />
      </DialogContent>
    </Dialog>
  );
};
