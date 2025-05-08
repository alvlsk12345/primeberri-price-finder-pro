
import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { ProductFilters, Product } from "@/services/types";

interface FilterPanelProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  results: Product[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFilterChange,
  results
}) => {
  // Локальное состояние для фильтров перед применением
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);
  
  // Доступные источники и бренды для фильтрации
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  
  // Диапазон цен для фильтрации
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  
  // Количество активных фильтров
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Вычисляем уникальные источники и бренды из результатов
  useEffect(() => {
    if (!results || results.length === 0) return;
    
    // Собираем уникальные источники
    const sources = Array.from(new Set(results.map(product => product.source)))
      .filter(source => source);
    
    // Собираем уникальные бренды
    const brands = Array.from(new Set(results.map(product => product.brand)))
      .filter(brand => brand) as string[];
    
    // Вычисляем мин. и макс. цену
    let minPrice = Infinity;
    let maxPrice = 0;
    
    results.forEach(product => {
      if ((product as any)._numericPrice) {
        minPrice = Math.min(minPrice, (product as any)._numericPrice);
        maxPrice = Math.max(maxPrice, (product as any)._numericPrice);
      }
    });
    
    if (minPrice === Infinity) minPrice = 0;
    if (maxPrice === 0) maxPrice = 1000;
    
    // Округляем ценовые значения для удобства
    minPrice = Math.floor(minPrice);
    maxPrice = Math.ceil(maxPrice);
    
    setAvailableSources(sources);
    setAvailableBrands(brands);
    setPriceRange([minPrice, maxPrice]);
    
    // Сбрасываем локальные фильтры к текущим основным фильтрам
    setLocalFilters(filters);
  }, [results]);
  
  // Подсчитываем количество активных фильтров
  useEffect(() => {
    let count = 0;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.brands && filters.brands.length > 0) count++;
    if (filters.sources && filters.sources.length > 0) count++;
    if (filters.rating) count++;
    setActiveFiltersCount(count);
  }, [filters]);
  
  // Обработчик изменения слайдера цен
  const handlePriceChange = (values: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1]
    }));
  };
  
  // Обработчик изменения брендов
  const handleBrandChange = (brand: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentBrands = prev.brands || [];
      let newBrands;
      
      if (checked) {
        newBrands = [...currentBrands, brand];
      } else {
        newBrands = currentBrands.filter(b => b !== brand);
      }
      
      return {
        ...prev,
        brands: newBrands.length > 0 ? newBrands : undefined
      };
    });
  };
  
  // Обработчик изменения источников
  const handleSourceChange = (source: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentSources = prev.sources || [];
      let newSources;
      
      if (checked) {
        newSources = [...currentSources, source];
      } else {
        newSources = currentSources.filter(s => s !== source);
      }
      
      return {
        ...prev,
        sources: newSources.length > 0 ? newSources : undefined
      };
    });
  };
  
  // Обработчик изменения рейтинга
  const handleRatingChange = (values: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      rating: values[0]
    }));
  };
  
  // Применение фильтров
  const applyFilters = () => {
    onFilterChange(localFilters);
  };
  
  // Сброс всех фильтров
  const resetFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };
  
  return (
    <div className="flex flex-col items-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            <span>Фильтры</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Цена</h3>
              <div className="px-2">
                <Slider
                  defaultValue={[priceRange[0], priceRange[1]]}
                  min={priceRange[0]}
                  max={priceRange[1]}
                  step={1}
                  value={[
                    localFilters.minPrice || priceRange[0],
                    localFilters.maxPrice || priceRange[1]
                  ]}
                  onValueChange={handlePriceChange}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>${localFilters.minPrice || priceRange[0]}</span>
                  <span>${localFilters.maxPrice || priceRange[1]}</span>
                </div>
              </div>
            </div>
            
            {availableBrands.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Бренды</h3>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {availableBrands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`brand-${brand}`} 
                        checked={(localFilters.brands || []).includes(brand)}
                        onCheckedChange={(checked) => 
                          handleBrandChange(brand, checked as boolean)
                        }
                      />
                      <Label htmlFor={`brand-${brand}`} className="text-sm">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {availableSources.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Магазины</h3>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {availableSources.map(source => (
                    <div key={source} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`source-${source}`} 
                        checked={(localFilters.sources || []).includes(source)}
                        onCheckedChange={(checked) => 
                          handleSourceChange(source, checked as boolean)
                        }
                      />
                      <Label htmlFor={`source-${source}`} className="text-sm">
                        {source}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-medium mb-2">Минимальный рейтинг</h3>
              <div className="px-2">
                <Slider
                  defaultValue={[localFilters.rating || 0]}
                  min={0}
                  max={5}
                  step={0.5}
                  value={[localFilters.rating || 0]}
                  onValueChange={handleRatingChange}
                  className="mb-2"
                />
                <div className="text-center text-sm">
                  {localFilters.rating ? `${localFilters.rating} и выше` : 'Любой рейтинг'}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Сбросить
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Применить
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
