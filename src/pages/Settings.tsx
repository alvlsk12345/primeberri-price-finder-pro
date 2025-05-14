
import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { useSettingsPageEffect } from "@/hooks/settings/useSettingsPageEffect";
import { getRouteInfo } from '@/utils/navigation';
import { ErrorBoundary } from "@/components/ErrorBoundary";

const SettingsContent = () => {
  console.log('[Settings] Рендер компонента SettingsContent');
  
  return (
    <div className="max-w-4xl mx-auto">
      <SettingsHeader />
      <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-md text-red-600 mt-4">
        Произошла ошибка при загрузке вкладок настроек. Пожалуйста, обновите страницу.
      </div>}>
        <SettingsTabs />
      </ErrorBoundary>
    </div>
  );
};

// Главный компонент страницы настроек
const Settings = () => {
  console.log('[Settings] Начало рендера компонента Settings');
  
  // Состояние для отслеживания готовности компонента
  const [isReady, setIsReady] = useState(false);
  
  // Используем хук для эффектов страницы настроек
  useSettingsPageEffect();

  // Эффект для задержки рендеринга, чтобы дать время для инициализации
  useEffect(() => {
    console.log('[Settings] Подготовка к рендеру контента');
    
    // Небольшая задержка для стабилизации состояния маршрута
    const timer = setTimeout(() => {
      setIsReady(true);
      console.log('[Settings] Компонент готов к рендеру контента');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Проверяем текущий маршрут перед рендерингом
  const routeInfo = getRouteInfo();
  console.log(`[Settings] Перед рендерингом, текущий маршрут: ${JSON.stringify(routeInfo)}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/30 to-brand/10 settings-page">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        {isReady ? (
          <ErrorBoundary fallback={<div className="p-6 bg-red-50 rounded-md text-red-600 max-w-4xl mx-auto">
            <h3 className="text-lg font-medium mb-2">Не удалось загрузить страницу настроек</h3>
            <p>Произошла ошибка при загрузке настроек. Пожалуйста, обновите страницу или вернитесь на главную.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
            >
              Обновить страницу
            </button>
          </div>}>
            <SettingsContent />
          </ErrorBoundary>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
        
        <PageFooter />
      </main>
    </div>
  );
};

export default Settings;
