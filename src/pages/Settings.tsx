
import React, { useState, useEffect, useMemo } from 'react';
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
  console.log('[Settings] НАЧАЛО рендера компонента Settings');
  
  // Проверка доступности localStorage в самом начале
  try {
    console.log('[Settings] Проверка localStorage:', !!window.localStorage);
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    console.log('[Settings] localStorage доступен');
  } catch (e) {
    console.error('[Settings] Ошибка при проверке localStorage:', e);
  }
  
  // Состояние для отслеживания готовности компонента
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Получаем информацию о маршруте с помощью useMemo для стабильности
  const routeInfo = useMemo(() => {
    console.log('[Settings] Получение информации о маршруте через useMemo');
    try {
      const info = getRouteInfo();
      console.log(`[Settings] Информация о маршруте: ${JSON.stringify(info)}`);
      return info;
    } catch (e) {
      console.error('[Settings] Ошибка при получении информации о маршруте:', e);
      setHasError(true);
      setErrorMessage('Ошибка при определении текущего маршрута');
      return { isSettings: true, path: 'settings', rawHash: '', rawPath: '' };
    }
  }, []);
  
  // Используем хук для эффектов страницы настроек
  try {
    console.log('[Settings] Перед вызовом useSettingsPageEffect');
    useSettingsPageEffect();
    console.log('[Settings] После вызова useSettingsPageEffect');
  } catch (e) {
    console.error('[Settings] Ошибка в useSettingsPageEffect:', e);
    // Не устанавливаем здесь ошибку, чтобы компонент продолжил рендериться
  }

  // Защита от неожиданных перенаправлений
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('[Settings] Событие beforeunload активировано');
      // В реальном приложении можно добавить логику для предотвращения ухода
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Эффект для задержки рендеринга, чтобы дать время для инициализации
  useEffect(() => {
    console.log('[Settings] Подготовка к рендеру контента');
    
    // Проверка, что мы на странице настроек
    if (!routeInfo.isSettings && !document.body.classList.contains('settings-page')) {
      console.warn('[Settings] Обнаружено, что мы не на странице настроек, добавляем соответствующие атрибуты');
      document.body.classList.add('settings-page');
      document.body.setAttribute('data-path', '/settings');
    }
    
    // Небольшая задержка для стабилизации состояния маршрута
    const timer = setTimeout(() => {
      try {
        console.log('[Settings] Устанавливаем isReady=true после таймаута');
        setIsReady(true);
      } catch (e) {
        console.error('[Settings] Ошибка при установке isReady=true:', e);
        setHasError(true);
        setErrorMessage('Не удалось инициализировать страницу настроек');
      }
    }, 150); // Увеличим задержку для большей стабильности
    
    return () => {
      console.log('[Settings] Очистка таймера в useEffect');
      clearTimeout(timer);
    };
  }, [routeInfo]);

  console.log(`[Settings] Перед рендерингом, isReady=${isReady}, hasError=${hasError}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/30 to-brand/10 settings-page">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        {hasError ? (
          <div className="p-6 bg-red-50 rounded-md text-red-600 max-w-4xl mx-auto">
            <h3 className="text-lg font-medium mb-2">Произошла ошибка на странице настроек</h3>
            <p>{errorMessage || 'Не удалось загрузить страницу настроек. Пожалуйста, обновите страницу или вернитесь на главную.'}</p>
            <div className="mt-4 flex space-x-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
              >
                Обновить страницу
              </button>
              <button 
                onClick={() => window.location.hash = '#/'} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
              >
                На главную
              </button>
            </div>
          </div>
        ) : isReady ? (
          <ErrorBoundary fallback={<div className="p-6 bg-red-50 rounded-md text-red-600 max-w-4xl mx-auto">
            <h3 className="text-lg font-medium mb-2">Не удалось загрузить страницу настроек</h3>
            <p>Произошла ошибка при загрузке настроек. Пожалуйста, обновите страницу или вернитесь на главную.</p>
            <div className="mt-4 flex space-x-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
              >
                Обновить страницу
              </button>
              <button 
                onClick={() => window.location.hash = '#/'} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
              >
                На главную
              </button>
            </div>
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
