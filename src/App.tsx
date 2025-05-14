
import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Index from './pages/Index';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { getRouteInfo } from './utils/navigation';

function App() {
  // This helps maintain the component state when navigating
  const location = useLocation();
  const navigate = useNavigate();
  
  // Эффект для установки data-path при изменении маршрута
  useEffect(() => {
    console.log(`[App] Обновление маршрута: ${location.pathname}, hash: ${location.hash}`);
    
    try {
      // Определяем текущий путь на основе hash или pathname
      let currentPath = '';
      
      if (location.hash && location.hash.startsWith('#/')) {
        // Если используется хеш, извлекаем из него путь
        currentPath = location.hash.replace('#', '');
      } else {
        // Если хеша нет, используем pathname
        currentPath = location.pathname;
      }
      
      // Устанавливаем data-path в body для использования в определении маршрута
      document.body.setAttribute('data-path', currentPath);
      console.log(`[App] Установлен data-path="${currentPath}" в body`);
      
      // Для страницы настроек устанавливаем специальный класс на body
      if (currentPath === '/settings') {
        document.body.classList.add('settings-page');
      } else {
        document.body.classList.remove('settings-page');
      }
    } catch (error) {
      console.error('[App] Ошибка при обработке маршрута:', error);
    }
    
    return () => {
      // При размонтировании компонента или изменении маршрута
      console.log('[App] Очистка атрибутов маршрута');
    };
  }, [location]);
  
  // Защита от навигации при ошибках
  useEffect(() => {
    // Сохраняем последний известный хороший маршрут для восстановления
    const lastGoodRoute = location.hash || '/';
    let isNavigatingDueToError = false;
    
    const handleUnexpectedNavigations = () => {
      if (isNavigatingDueToError) return; // Предотвращаем рекурсивные вызовы
      
      const routeInfo = getRouteInfo();
      if (routeInfo.isSettings && location.hash !== '#/settings') {
        console.warn('[App] Обнаружена попытка неожиданной навигации со страницы настроек');
        toast.error('Произошла ошибка при навигации', {
          description: 'Восстанавливаем предыдущий маршрут',
          duration: 3000
        });
        
        // Восстанавливаем маршрут
        try {
          isNavigatingDueToError = true;
          window.location.hash = '#/settings';
          setTimeout(() => { isNavigatingDueToError = false; }, 100);
        } catch (e) {
          console.error('[App] Ошибка при восстановлении маршрута:', e);
        }
      }
    };
    
    // Отслеживаем неожиданную навигацию
    window.addEventListener('popstate', handleUnexpectedNavigations);
    
    return () => {
      window.removeEventListener('popstate', handleUnexpectedNavigations);
    };
  }, [location]);
  
  // Обработчик ошибок для глобальных исключений
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('[App] Глобальная ошибка:', event.error || event.message);
      
      // Проверяем текущий маршрут
      const routeInfo = getRouteInfo();
      console.log(`[App] Маршрут при возникновении глобальной ошибки: ${JSON.stringify(routeInfo)}`);
      
      // Показываем сообщение об ошибке
      toast.error('Произошла ошибка в приложении', {
        description: 'Пожалуйста, обновите страницу, если приложение работает некорректно',
        duration: 5000,
      });
      
      // Предотвращаем перенаправление
      event.preventDefault();
    };
    
    window.addEventListener('error', handleGlobalError);
    
    // Также добавляем обработчик для непойманных промисов
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      console.error('[App] Необработанное отклонение промиса:', event.reason);
      
      // Проверяем, связана ли ошибка с localStorage
      const isLocalStorageError = event.reason && 
        (event.reason.toString().includes('localStorage') || 
         (event.reason.message && event.reason.message.includes('localStorage')));
      
      if (isLocalStorageError) {
        toast.error('Проблема с доступом к локальному хранилищу', {
          description: 'Некоторые функции могут работать некорректно',
          duration: 5000,
        });
      }
      
      // Предотвращаем перенаправление
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);
  
  return (
    <>
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <SonnerToaster position="bottom-right" closeButton={true} />
    </>
  );
}

export default App;
