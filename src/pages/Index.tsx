
import React, { useEffect } from 'react';
import { SearchProvider } from "@/contexts/SearchContext";
import { SearchContainer } from "@/components/search/SearchContainer";
import { BenefitsSection } from "@/components/BenefitsSection";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";
import { getRouteInfo, getNormalizedRouteForLogging } from "@/utils/navigation";

const Index = () => {
  // Расширенное логирование для отладки
  useEffect(() => {
    console.log(`[Index] Компонент Index смонтирован, текущий маршрут: ${getNormalizedRouteForLogging()}`);
    
    // Установка атрибута data-path в body для корректного определения маршрута
    document.body.setAttribute('data-path', '/');
    
    return () => {
      console.log('[Index] Компонент Index размонтирован');
      
      // Очистка атрибута только если мы всё еще на главной странице
      const currentRouteInfo = getRouteInfo();
      if (currentRouteInfo.isIndex) {
        document.body.removeAttribute('data-path');
      }
    };
  }, []);
  
  const routeInfo = getRouteInfo();
  console.log(`[Index] Рендер компонента Index, текущий маршрут: ${getNormalizedRouteForLogging()}`);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/30 to-brand/10">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <SearchProvider>
          <SearchContainer />
        </SearchProvider>

        <BenefitsSection />
        <PageFooter />
      </main>
    </div>
  );
};

export default Index;
