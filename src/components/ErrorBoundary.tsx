
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Обновляем состояние, чтобы при следующем рендере показать запасной UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Можно также отправить отчет об ошибке в аналитику
    console.error("[ErrorBoundary] Перехвачена ошибка:", error);
    console.error("[ErrorBoundary] Информация о компоненте:", errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Возвращаем запасной UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
