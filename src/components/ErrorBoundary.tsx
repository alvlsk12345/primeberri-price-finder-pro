
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error component stack:', errorInfo.componentStack);
    
    // Update state to include errorInfo for debugging
    this.setState({ errorInfo });
    
    // Notify the user about the error
    toast.error("Произошла ошибка в приложении");
    
    // Check if this is an API-related error
    const isApiError = error.message && (
      error.message.includes('API') || 
      error.message.includes('fetch') ||
      error.message.includes('503') ||
      error.message.includes('network')
    );
    
    // Show more specific toast for API errors
    if (isApiError) {
      toast.error("Проблема с подключением к API. Отображаются демонстрационные данные.");
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    toast.success("Восстановление состояния после ошибки");
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Что-то пошло не так
          </h3>
          <p className="text-red-700 mb-4">
            Произошла ошибка при загрузке компонента поиска.
            {this.state.error && (
              <span className="block text-sm mt-1 opacity-75">
                {this.state.error.toString().includes('API') 
                  ? 'Проблема с доступом к API. Возможно, сервис временно недоступен.'
                  : this.state.error.toString()}
              </span>
            )}
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={this.resetError}
              variant="destructive"
              className="mx-auto flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Попробовать снова
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
