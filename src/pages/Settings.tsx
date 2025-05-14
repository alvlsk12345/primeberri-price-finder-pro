
import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { useSettingsPageEffect } from "@/hooks/settings/useSettingsPageEffect";
import { getRouteInfo } from '@/utils/navigation';

// Отключаем SearchProvider на странице настроек, чтобы избежать автоматических проверок
const Settings = () => {
  console.log('[Settings] Рендер компонента Settings - улучшенная версия');
  
  // Используем хук для эффектов страницы настроек
  useSettingsPageEffect();

  // Проверяем текущий маршрут перед рендерингом
  const routeInfo = getRouteInfo();
  console.log(`[Settings] Перед рендерингом, текущий маршрут: ${JSON.stringify(routeInfo)}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/30 to-brand/10 settings-page">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <SettingsHeader />
          <SettingsTabs />
        </div>
        
        <PageFooter />
      </main>
    </div>
  );
};

export default Settings;
