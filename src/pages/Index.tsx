
import React from 'react';
import { SearchProvider } from "@/contexts/search";
import { SearchContainerWithErrorBoundary } from "@/components/search/SearchContainerWithErrorBoundary";
import { BenefitsSection } from "@/components/BenefitsSection";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <SearchProvider>
          <SearchContainerWithErrorBoundary />
        </SearchProvider>

        <BenefitsSection />
        <PageFooter />
      </main>
    </div>
  );
};

export default Index;
