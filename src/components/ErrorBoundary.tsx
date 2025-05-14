
import React, { Component, ErrorInfo, ReactNode } from "react";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Обновляем состояние, чтобы при следующем рендере показать запасной UI
    console.error("[ErrorBoundary] Перехвачена ошибка в getDerivedStateFromError:", error);
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Логируем подробную информацию об ошибке
    console.error("[ErrorBoundary] Перехвачена ошибка:", error);
    console.error("[ErrorBoundary] Информация о компоненте:", errorInfo);
    
    // Отображаем toast сообщение о перехваченной ошибке
    try {
      toast.error("Произошла ошибка в компоненте", {
        description: error.message.substring(0, 100), // Ограничиваем длину сообщения
        duration: 6000
      });
    } catch (toastError) {
      console.error("[ErrorBoundary] Ошибка при отображении toast:", toastError);
    }
    
    // Сохраняем errorInfo в состоянии для возможного отображения
    this.setState({ errorInfo });
    
    // Стабилизация перед попыткой восстановления
    setTimeout(() => {
      console.log("[ErrorBoundary] Попытка стабилизации после ошибки...");
    }, 100);
    
    // Предотвращаем перезагрузку страницы из-за необработанных ошибок
    try {
      // Сохраняем оригинальный обработчик
      const originalOnError = window.onerror;
      
      window.onerror = function(message, source, line, column, error) {
        console.error("[ErrorBoundary] window.onerror перехватил ошибку:", message);
        console.log("[ErrorBoundary] Детали ошибки:", { source, line, column });
        
        // Проверяем, связана ли ошибка с localStorage
        const isStorageError = typeof message === 'string' && (
          message.includes('localStorage') || 
          message.includes('Storage') || 
          message.includes('storage')
        );
        
        // Проверяем, связана ли ошибка с навигацией
        const isNavigationError = typeof message === 'string' && (
          message.includes('navigation') || 
          message.includes('location') || 
          message.includes('history')
        );
        
        if (isStorageError) {
          console.warn("[ErrorBoundary] Обнаружена возможная ошибка localStorage:", message);
          try {
            toast.warning("Проблема с доступом к локальному хранилищу", {
              description: "Некоторые функции могут работать некорректно",
              duration: 5000
            });
          } catch (e) {
            console.error("[ErrorBoundary] Не удалось показать toast:", e);
          }
        }
        
        if (isNavigationError) {
          console.warn("[ErrorBoundary] Обнаружена возможная ошибка навигации:", message);
          // Предотвращаем перенаправление при ошибках навигации
          try {
            const currentPath = window.location.hash || window.location.pathname;
            console.log("[ErrorBoundary] Текущий путь при ошибке навигации:", currentPath);
            
            // Если мы на странице настроек, убеждаемся что data-path установлен правильно
            if (currentPath.includes('settings')) {
              document.body.setAttribute('data-path', '/settings');
              document.body.classList.add('settings-page');
              console.log("[ErrorBoundary] Восстановлен атрибут data-path для страницы настроек");
            }
          } catch (navError) {
            console.error("[ErrorBoundary] Ошибка при обработке ошибки навигации:", navError);
          }
        }
        
        if (originalOnError) {
          return originalOnError(message, source, line, column, error);
        }
        
        // Предотвращаем перезагрузку страницы
        return true;
      };
      
      // Также предотвращаем непойманные отклонения промисов
      const originalOnUnhandledRejection = window.onunhandledrejection;
      window.onunhandledrejection = function(event) {
        console.error('[ErrorBoundary] Необработанное отклонение промиса:', event.reason);
        
        // Проверяем, связано ли отклонение с localStorage
        const reason = event.reason?.toString() || '';
        if (reason.includes('localStorage') || reason.includes('Storage') || reason.includes('storage')) {
          console.warn('[ErrorBoundary] Необработанное отклонение связано с localStorage:', reason);
          try {
            toast.warning("Проблема с доступом к локальному хранилищу", {
              description: "Используются значения по умолчанию",
              duration: 5000
            });
          } catch (e) {
            console.error("[ErrorBoundary] Не удалось показать toast:", e);
          }
        }
        
        if (originalOnUnhandledRejection) {
          originalOnUnhandledRejection.call(window, event);
        }
        
        // Предотвращаем перезагрузку
        event.preventDefault();
        
        return true;
      };
      
    } catch (handlerError) {
      console.error("[ErrorBoundary] Ошибка при установке обработчика window.onerror:", handlerError);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Если есть customFallback, используем его, иначе дефолтный UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Дефолтный запасной UI
      return (
        <div className="p-4 bg-red-50 rounded-md text-red-600 mt-4">
          <h3 className="text-lg font-medium mb-2">Произошла ошибка</h3>
          <p className="mb-2">Что-то пошло не так при отображении этого компонента.</p>
          {this.state.error && (
            <pre className="text-sm bg-red-100 p-2 rounded overflow-auto max-h-24">
              {this.state.error.toString()}
            </pre>
          )}
          <div className="mt-4 flex space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
