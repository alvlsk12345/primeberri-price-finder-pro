
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
    let navigationBlocked = false;
    
    const handleUnexpectedNavigations = () => {
      if (isNavigatingDueToError) return; // Предотвращаем рекурсивные вызовы
      
      const routeInfo = getRouteInfo();
      
      // Проверяем признак того, что мы на странице настроек
      const isSettingsPage = 
        routeInfo.isSettings || 
        document.body.classList.contains('settings-page') || 
        document.body.getAttribute('data-path') === '/settings';
      
      // Если мы на странице настроек, но URL не соответствует
      if (isSettingsPage && location.hash !== '#/settings') {
        console.warn('[App] Обнаружена попытка неожиданной навигации со страницы настроек');
        
        if (!navigationBlocked) {
          navigationBlocked = true; // Устанавливаем блокировку для предотвращения множественных тостов
          
          toast.error('Произошла ошибка при навигации', {
            description: 'Восстанавливаем предыдущий маршрут',
            duration: 3000
          });
          
          // Восстанавливаем маршрут с небольшой задержкой
          setTimeout(() => {
            try {
              isNavigatingDueToError = true;
              window.location.hash = '#/settings';
              
              // Устанавливаем таймер для снятия блокировки через некоторое время
              setTimeout(() => { 
                isNavigatingDueToError = false; 
                navigationBlocked = false;
              }, 300);
            } catch (e) {
              console.error('[App] Ошибка при восстановлении маршрута:', e);
            }
          }, 100);
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
      
      // Предотвращаем перенаправление и дальнейшую обработку ошибки
      event.preventDefault();
      event.stopPropagation();
      
      return false; // Предотвращаем стандартное поведение
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
      event.stopPropagation();
      
      return false;
    };
    
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    // Предотвращаем перезагрузку страницы при ошибках
    const originalOnError = window.onerror;
    window.onerror = function(message, source, line, column, error) {
      console.error('[App] window.onerror перехватил ошибку:', { message, source, line, column });
      
      // Проверяем ошибки localStorage
      if (message && typeof message === 'string' && 
          (message.includes('localStorage') || message.includes('Storage'))) {
        console.warn('[App] Обнаружена ошибка localStorage:', message);
        toast.warning('Проблемы с доступом к локальному хранилищу', {
          description: 'Будут использованы значения по умолчанию',
          duration: 5000
        });
      }
      
      if (originalOnError) {
        return originalOnError(message, source, line, column, error);
      }
      
      // Предотвращаем стандартную обработку ошибки
      return true;
    };
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      window.onerror = originalOnError;
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
