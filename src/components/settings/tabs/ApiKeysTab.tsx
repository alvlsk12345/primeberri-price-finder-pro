
import React from 'react';
import { ApiKeyForm } from "@/components/ApiKeyForm";

export const ApiKeysTab: React.FC = () => {
  return (
    <div className="grid gap-6">
      <ApiKeyForm keyType="zylalabs" />
      <ApiKeyForm keyType="openai" />
      <ApiKeyForm keyType="abacus" />
    </div>
  );
};
