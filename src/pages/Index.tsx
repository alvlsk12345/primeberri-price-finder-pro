
import React from 'react';
import { SearchProvider } from "@/contexts/SearchContext";
import { SearchContainer } from "@/components/search/SearchContainer";
import { BenefitsSection } from "@/components/BenefitsSection";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-brand-lightBlue">
      <PageHeader />
      
      <main className="container mx-auto px-4 py-8">
        <section className="py-12 md:py-20 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="max-w-lg">
              <span className="inline-block px-4 py-1 bg-white/50 text-sm font-medium rounded-full mb-4">
                🛍️ Помогаем
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Выкуп и доставка оригинальных брендов из Европы
              </h1>
              <p className="text-lg mb-6 text-gray-700">
                Надежная доставка от 9 дней по всей России всего от 9,5€
                Оплата российской картой
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-brand-red hover:bg-brand-red/90 text-white rounded-full px-8 py-6 font-medium">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Оформить заказ
                </Button>
                <Button variant="outline" className="bg-white/70 text-gray-800 hover:bg-white rounded-full px-8 py-6 font-medium">
                  Как это работает
                </Button>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <img src="/lovable-uploads/cc731a61-2d46-4e13-9684-4eebeb4e8d69.png" alt="Brands collage" className="hidden md:block w-full object-contain animate-fade-in rounded-xl shadow-md" />
              <div className="grid grid-rows-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm card-hover">
                  <img 
                    src="https://cdn.shopify.com/s/files/1/0007/5264/8296/files/zara-logo.jpg" 
                    alt="Zara" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm card-hover">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_New_Logo_2D.svg/2048px-HP_New_Logo_2D.svg.png" 
                    alt="H&M" 
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <SearchProvider>
          <SearchContainer />
        </SearchProvider>

        <BenefitsSection />
        
        <section className="mt-16 bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            Популярные магазины
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-gray-50 rounded-lg p-4 aspect-square flex items-center justify-center card-hover">
                <img
                  src={`https://via.placeholder.com/150x80?text=Brand ${item}`}
                  alt={`Brand ${item}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </section>
        
        <PageFooter />
      </main>
    </div>
  );
};

export default Index;
