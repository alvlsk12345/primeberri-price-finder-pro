
import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { ApiKeyForm } from "@/components/ApiKeyForm";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <ApiKeyForm />
      </main>
    </div>
  );
};

export default Settings;
