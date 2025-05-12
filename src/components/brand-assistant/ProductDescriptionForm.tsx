
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";

interface ProductDescriptionFormProps {
  productDescription: string;
  setProductDescription: (description: string) => void;
  isAssistantLoading: boolean;
  handleGetBrandSuggestions: () => void;
}

export const ProductDescriptionForm: React.FC<ProductDescriptionFormProps> = ({
  productDescription,
  setProductDescription,
  isAssistantLoading,
  handleGetBrandSuggestions
}) => {
  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Опишите, что вы хотите найти, например: удобные кроссовки для бега по пересеченной местности"
        value={productDescription}
        onChange={(e) => {
          console.log("Текст в Textarea изменен:", e.target.value);
          setProductDescription(e.target.value);
        }}
        className="min-h-[80px] resize-none"
      />
      <div className="flex justify-end">
        <Button
          variant="brand"
          size="sm"
          onClick={handleGetBrandSuggestions}
          disabled={!productDescription.trim() || isAssistantLoading}
        >
          {isAssistantLoading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-brand-foreground border-t-transparent rounded-full mr-2" />
              <span>Поиск товаров...</span>
            </>
          ) : (
            <>
              <Search size={16} className="mr-2" />
              <span>Найти подходящие товары</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
