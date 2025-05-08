
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface BrandsFilterProps {
  availableBrands: string[];
  selectedBrands: string[];
  onBrandChange: (brand: string, checked: boolean) => void;
}

export const BrandsFilter: React.FC<BrandsFilterProps> = ({
  availableBrands,
  selectedBrands,
  onBrandChange
}) => {
  if (availableBrands.length === 0) return null;
  
  return (
    <div>
      <h3 className="font-medium mb-2">Бренды</h3>
      <div className="max-h-32 overflow-y-auto space-y-2">
        {availableBrands.map(brand => (
          <div key={brand} className="flex items-center space-x-2">
            <Checkbox 
              id={`brand-${brand}`} 
              checked={selectedBrands.includes(brand)}
              onCheckedChange={(checked) => 
                onBrandChange(brand, checked as boolean)
              }
            />
            <Label htmlFor={`brand-${brand}`} className="text-sm">
              {brand}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
