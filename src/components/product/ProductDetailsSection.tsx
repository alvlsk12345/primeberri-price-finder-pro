
import React, { useEffect } from 'react';
import { CostCalculator } from "@/components/CostCalculator";
import { ActionButtons } from "@/components/ActionButtons";
import { useSearch } from "@/contexts/SearchContext";
import { isOnSettingsPage, getRouteInfo, getNormalizedRouteForLogging } from "@/utils/navigation";

export const ProductDetailsSection: React.FC = () => {
  // Добавляем расширенное логирование для отладки
  useEffect(() => {
    console.log(`[ProductDetailsSection] Монтируем ProductDetailsSection, текущий маршрут: ${getNormalizedRouteForLogging()}`);
    
    return () => {
      console.log('[ProductDetailsSection] Размонтируем ProductDetailsSection');
    };
  }, []);
  
  // Проверяем, находимся ли мы на странице настроек
  const routeInfo = getRouteInfo();
  if (routeInfo.isSettings) {
    console.log('[ProductDetailsSection] Компонент на странице настроек - не отображаем');
    return null;
  }
  
  // Более безопасное использование контекста
  try {
    console.log('[ProductDetailsSection] Пытаемся использовать useSearch()');
    const { selectedProduct, searchQuery } = useSearch();
    console.log('[ProductDetailsSection] useSearch выполнен успешно');
    
    if (!selectedProduct) {
      return null;
    }
    
    return (
      <div className="mt-6 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">Детали выбранного товара</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CostCalculator product={selectedProduct} />
          <ActionButtons selectedProduct={selectedProduct} searchQuery={searchQuery} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("[ProductDetailsSection] Ошибка при использовании useSearch:", error);
    return null;
  }
};
