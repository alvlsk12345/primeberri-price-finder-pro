
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
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
    
    // Сохраняем errorInfo в состоянии для возможного отображения
    this.setState({ errorInfo });
    
    // Здесь можно добавить отправку логов ошибок в аналитику
    try {
      // Предотвращаем перезагрузку страницы из-за необработанных ошибок
      const originalOnError = window.onerror;
      window.onerror = function(message, source, line, column, error) {
        if (originalOnError) {
          return originalOnError(message, source, line, column, error);
        }
        console.error("[ErrorBoundary] window.onerror перехватил ошибку:", message);
        return true; // Предотвращаем перезагрузку
      };
    } catch (handlerError) {
      console.error("[ErrorBoundary] Ошибка при установке обработчика window.onerror:", handlerError);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Возвращаем запасной UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
