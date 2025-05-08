
import React from 'react';
import { Slider } from "@/components/ui/slider";

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  priceRange: [number, number];
  onPriceChange: (values: number[]) => void;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  priceRange,
  onPriceChange
}) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Цена</h3>
      <div className="px-2">
        <Slider
          defaultValue={[priceRange[0], priceRange[1]]}
          min={priceRange[0]}
          max={priceRange[1]}
          step={1}
          value={[
            minPrice || priceRange[0],
            maxPrice || priceRange[1]
          ]}
          onValueChange={onPriceChange}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>${minPrice || priceRange[0]}</span>
          <span>${maxPrice || priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
};
