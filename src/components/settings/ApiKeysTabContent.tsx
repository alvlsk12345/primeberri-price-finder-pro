
import React from 'react';
import { SafeApiKeyForm } from "@/components/ApiKeyForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const ApiKeysTabContent: React.FC = () => {
  return (
    <div className="grid gap-6">
      <ErrorBoundary fallback={
        <div className="p-4 bg-red-50 rounded-md text-red-600">
          <h3 className="font-medium mb-2">Ошибка при загрузке формы ключа Zylalabs</h3>
          <p>Причиной может быть проблема с доступом к локальному хранилищу.</p>
        </div>
      }>
        <SafeApiKeyForm keyType="zylalabs" />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={
        <div className="p-4 bg-red-50 rounded-md text-red-600">
          <h3 className="font-medium mb-2">Ошибка при загрузке формы ключа OpenAI</h3>
          <p>Причиной может быть проблема с доступом к локальному хранилищу.</p>
        </div>
      }>
        <SafeApiKeyForm keyType="openai" />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={
        <div className="p-4 bg-red-50 rounded-md text-red-600">
          <h3 className="font-medium mb-2">Ошибка при загрузке формы ключа Abacus</h3>
          <p>Причиной может быть проблема с доступом к локальному хранилищу.</p>
        </div>
      }>
        <SafeApiKeyForm keyType="abacus" />
      </ErrorBoundary>
    </div>
  );
};
