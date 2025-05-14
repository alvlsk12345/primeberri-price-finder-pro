
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { useSettingsPageEffect } from "@/hooks/settings/useSettingsPageEffect";
import { getRouteInfo } from '@/utils/navigation';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import { getSupabaseAIConfig, SupabaseAIConfig } from "@/services/api/supabase/config";

// Компонент для содержимого настроек, чтобы изолировать его от основного компонента Settings
const SettingsContent = () => {
  console.log('[SettingsContent] === НАЧАЛО рендера компонента SettingsContent ===');
  
  return (
    <div className="max-w-4xl mx-auto">
      <SettingsHeader />
      <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-md text-red-600 mt-4">
        <h3 className="text-lg font-medium mb-2">Произошла ошибка при загрузке вкладок настроек</h3>
        <p>Пожалуйста, обновите страницу или вернитесь позже.</p>
        <div className="mt-4 flex space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
          >
            Обновить страницу
          </button>
        </div>
      </div>}>
        <SettingsTabs />
      </ErrorBoundary>
    </div>
  );
};

// Главный компонент страницы настроек
const SettingsPage = () => {
  console.log('%c[Settings] === НАЧАЛО рендера компонента Settings ===', 'color: blue; font-weight: bold;');
  
  // Проверка доступности localStorage в самом начале
  let isLocalStorageAvailable = false;
  try {
    console.log('[Settings] Проверка localStorage:', !!window.localStorage);
    const testKey = '__test_settings_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    console.log('[Settings] localStorage доступен');
    isLocalStorageAvailable = true;
  } catch (e) {
    console.error('[Settings] Ошибка при проверке localStorage:', e);
    isLocalStorageAvailable = false;
  }
  
  // Состояние для отслеживания готовности компонента
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Получаем информацию о маршруте с помощью useMemo для стабильности
  const routeInfo = useMemo(() => {
    console.log('[Settings] ПЕРЕД useMemo для routeInfo');
    try {
      const info = getRouteInfo();
      console.log('[Settings] Информация о маршруте:', JSON.stringify(info));
      return info;
    } catch (e) {
      console.error('[Settings] Ошибка при получении информации о маршруте:', e);
      setHasError(true);
      setErrorMessage('Ошибка при определении текущего маршрута');
      return { isSettings: true, path: 'settings', rawHash: '', rawPath: '' };
    }
  }, []);
  
  // Получаем начальную конфигурацию Supabase с помощью useMemo для стабильности и логирования
  console.log('[Settings] ПЕРЕД useMemo для initialSupabaseConfig');
  const initialSupabaseConfig = useMemo(() => {
    console.log('%c[Settings -> useMemo ДЛЯ initialSupabaseConfig] ВЫЗОВ getSupabaseAIConfig', 'color: purple; font-weight: bold;');
    try {
      return getSupabaseAIConfig(); 
    } catch (e) {
      console.error('[Settings] Ошибка при получении Supabase конфигурации:', e);
      return {
        useSupabaseBackend: true,
        fallbackToDirectCalls: true
      } as SupabaseAIConfig;
    }
  }, []);
  console.log('[Settings] ПОСЛЕ useMemo для initialSupabaseConfig, результат:', JSON.stringify(initialSupabaseConfig)); 
  
  // Защита от некорректных маршрутов - проверяем, что мы действительно на странице настроек
  useEffect(() => {
    if (!routeInfo.isSettings) {
      console.warn('[Settings] Обнаружена попытка загрузки страницы Settings с некорректным маршрутом:', routeInfo);
      setHasError(true);
      setErrorMessage('Произошла ошибка при загрузке настроек: некорректный маршрут');
    }
  }, [routeInfo]);
  
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
    
    // Увеличенная задержка для стабилизации состояния маршрута
    const timer = setTimeout(() => {
      try {
        console.log('%c[Settings] Устанавливаем isReady=true после таймаута', 'color:green; font-weight:bold;');
        setIsReady(true);
      } catch (e) {
        console.error('[Settings] Ошибка при установке isReady=true:', e);
        setHasError(true);
        setErrorMessage('Не удалось инициализировать страницу настроек');
      }
    }, 500); // Увеличили задержку для большей стабильности
    
    return () => {
      console.log('[Settings] Очистка таймера в useEffect');
      clearTimeout(timer);
    };
  }, [routeInfo]);

  // Защита от потенциальных ошибок в localStorage
  useEffect(() => {
    if (!isLocalStorageAvailable) {
      console.warn('[Settings] localStorage недоступен, возможны проблемы с функциональностью страницы');
      toast.warning('Обнаружены проблемы с доступом к localStorage. Некоторые функции могут работать некорректно.');
    }
  }, [isLocalStorageAvailable]);

  console.log(`[Settings] Перед рендерингом, isReady=${isReady}, hasError=${hasError}`);
  console.log('%c[Settings] === ПЕРЕД РЕНДЕРОМ ErrorBoundary + СОДЕРЖИМОГО ===', 'color: blue; font-weight: bold;');

  // Компонент рендеринга с защитой ErrorBoundary
  try {
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
  } catch (e) {
    console.error('%c[Settings] КРИТИЧЕСКАЯ ОШИБКА РЕНДЕРИНГА Settings (внешний try-catch):', 'color: red; font-size: 16px;', e);
    return (
      <div className="p-6 bg-red-50 rounded-md text-red-600 max-w-4xl mx-auto">
        <h3 className="text-lg font-medium mb-2">Критическая ошибка рендеринга страницы настроек</h3>
        <p>Произошла неожиданная ошибка. Пожалуйста, обновите страницу или вернитесь на главную.</p>
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
    );
  }
};

export default SettingsPage;
