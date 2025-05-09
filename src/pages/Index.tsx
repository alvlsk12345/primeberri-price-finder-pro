
import React from 'react';
import { SearchProvider } from "@/contexts/SearchContext";
import { SearchContainer } from "@/components/search/SearchContainer";
import { BenefitsSection } from "@/components/BenefitsSection";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <SearchProvider>
          <SearchContainer />
        </SearchProvider>

        <BenefitsSection />
        <PageFooter />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default Index;
