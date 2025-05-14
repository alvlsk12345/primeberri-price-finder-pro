
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchFormSection } from "@/components/search/SearchFormSection";
import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { NoResultsMessage } from "@/components/search/NoResultsMessage";
import { ProductDetailsSection } from "@/components/product/ProductDetailsSection";
import { isOnSettingsPage, getRouteInfo, getNormalizedRouteForLogging } from "@/utils/navigation";

export const SearchContainer: React.FC = () => {
  // Проверка, находимся ли мы на странице настроек, используя улучшенную функцию
  const routeInfo = getRouteInfo();
  const inSettingsPage = routeInfo.isSettings;
  
  // Добавляем расширенное логирование для отладки
  useEffect(() => {
    console.log(`[SearchContainer] Монтируем SearchContainer, текущий маршрут: ${getNormalizedRouteForLogging()}`);
    
    return () => {
      console.log('[SearchContainer] Размонтируем SearchContainer');
    };
  }, []);
  
  console.log(`[SearchContainer] Рендер SearchContainer, inSettingsPage=${inSettingsPage}, маршрут: ${getNormalizedRouteForLogging()}`);
  
  return (
    <Card className="max-w-4xl mx-auto shadow-md border-brand/20">
      <CardHeader className="text-center bg-brand/10 rounded-t-md">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <a href="https://primeberri.com/" target="_blank" rel="noopener noreferrer">
            
          </a>
          Ищите товары в магазинах Европы, выбирайте и заказывайте на Primeberri
        </CardTitle>
        <CardDescription>Кликнув "Заказать на Primeberri", вы получите скопированную ссылку для заказа</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <SearchFormSection />
          {!inSettingsPage && (
            <>
              <SafeRenderComponent>
                <NoResultsMessage />
              </SafeRenderComponent>
              <SafeRenderComponent>
                <SearchResultsSection />
              </SafeRenderComponent>
              <SafeRenderComponent>
                <ProductDetailsSection />
              </SafeRenderComponent>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Компонент-обертка для безопасного рендеринга дочерних компонентов
const SafeRenderComponent: React.FC<{children: React.ReactNode}> = ({ children }) => {
  try {
    // Дополнительная проверка - если на странице настроек, не рендерим
    if (isOnSettingsPage()) {
      return null;
    }
    return <>{children}</>;
  } catch (error) {
    console.error('[SafeRenderComponent] Ошибка при рендере:', error);
    return null;
  }
};

