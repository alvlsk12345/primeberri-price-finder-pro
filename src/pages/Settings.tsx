
import React from 'react';
import SettingsPage from "@/components/settings/SettingsPage";
import ErrorBoundary from "@/components/ErrorBoundary";

const Settings = () => {
  console.log('[Settings] Рендеринг компонента Settings');
  
  return (
    <ErrorBoundary fallback={
      <div className="p-8 bg-red-50 text-red-700 rounded-md">
        <h2 className="text-xl font-bold mb-4">Критическая ошибка в компоненте настроек</h2>
        <p>Произошла непредвиденная ошибка при рендеринге страницы настроек.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
        >
          Обновить страницу
        </button>
      </div>
    }>
      <SettingsPage />
    </ErrorBoundary>
  );
};

export default Settings;
