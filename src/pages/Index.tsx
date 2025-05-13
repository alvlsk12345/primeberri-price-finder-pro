
import React from 'react';
import { SearchProvider } from "@/contexts/SearchContext";
import { SearchContainer } from "@/components/search/SearchContainer";
import { BenefitsSection } from "@/components/BenefitsSection";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";

const Index = () => {
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
