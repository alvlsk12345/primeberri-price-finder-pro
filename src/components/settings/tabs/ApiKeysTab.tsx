
import React, { Suspense } from 'react';
import { SafeApiKeyForm } from "@/components/api-key";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const ApiKeysTab: React.FC = () => {
  return (
    <div className="grid gap-6">
      <ErrorBoundary>
        <Suspense fallback={<div className="py-4 text-center">Загрузка настроек Zylalabs...</div>}>
          <SafeApiKeyForm keyType="zylalabs" />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Suspense fallback={<div className="py-4 text-center">Загрузка настроек OpenAI...</div>}>
          <SafeApiKeyForm keyType="openai" />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Suspense fallback={<div className="py-4 text-center">Загрузка настроек Abacus...</div>}>
          <SafeApiKeyForm keyType="abacus" />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
