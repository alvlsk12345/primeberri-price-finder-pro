
import { useEffect } from 'react';
import { getRouteInfo } from '@/utils/navigation';
import { clearConnectionCache } from "@/services/api/supabase/client";

export const useSettingsPageEffect = () => {
  // Устанавливаем атрибут data-path в body при монтировании компонента
  useEffect(() => {
    console.log('[Settings] useEffect - устанавливаем data-path /settings');
    document.body.setAttribute('data-path', '/settings');
    document.body.classList.add('settings-page');
    
    // Удаляем setTimeout для предотвращения очистки кеша в ранней фазе монтирования
    // Это предотвращает нестабильную работу при проверке маршрута
    
    return () => {
      console.log('[Settings] useEffect - удаляем data-path при размонтировании');
      document.body.removeAttribute('data-path');
      document.body.classList.remove('settings-page');
    };
  }, []);

  // Дополнительный эффект для проверки и логирования текущего маршрута
  useEffect(() => {
    const routeInfo = getRouteInfo();
    console.log(`[Settings] Текущий маршрут после монтирования: ${JSON.stringify(routeInfo)}`);
    
    // Дополнительная защита от перенаправления - проверяем раз в секунду
    // Но НЕ очищаем кеш соединения здесь
    const intervalId = setInterval(() => {
      const currentRouteInfo = getRouteInfo();
      if (!currentRouteInfo.isSettings) {
        console.warn(`[Settings] Обнаружен некорректный маршрут: ${JSON.stringify(currentRouteInfo)}`);
        // Восстанавливаем правильный атрибут
        document.body.setAttribute('data-path', '/settings');
        document.body.classList.add('settings-page');
      }
    }, 1000);
    
    // Очистка интервала при размонтировании
    return () => {
      clearInterval(intervalId);
    };
  }, []);
};
