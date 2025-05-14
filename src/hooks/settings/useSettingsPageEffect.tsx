
import { useEffect } from 'react';
import { getRouteInfo } from '@/utils/navigation';

export const useSettingsPageEffect = () => {
  // Устанавливаем атрибут data-path в body при монтировании компонента
  useEffect(() => {
    console.log('[Settings] useEffect - устанавливаем data-path /settings');
    
    // Добавляем класс settings-page на body (высокий приоритет для определения маршрута)
    document.body.classList.add('settings-page');
    
    // Устанавливаем data-path как запасной вариант
    document.body.setAttribute('data-path', '/settings');
    
    // Очистка при размонтировании
    return () => {
      console.log('[Settings] useEffect - удаляем классы и атрибуты при размонтировании');
      document.body.classList.remove('settings-page');
      
      // Проверяем, что мы все еще на странице настроек перед удалением атрибута
      const currentRouteInfo = getRouteInfo();
      if (!currentRouteInfo.isSettings) {
        document.body.removeAttribute('data-path');
      }
    };
  }, []);

  // Дополнительный эффект для проверки и логирования текущего маршрута
  useEffect(() => {
    const routeInfo = getRouteInfo();
    console.log(`[Settings] Текущий маршрут после монтирования: ${JSON.stringify(routeInfo)}`);
    
    // Проверяем маршрут каждые 2 секунды, но без очистки кеша
    const intervalId = setInterval(() => {
      const currentRouteInfo = getRouteInfo();
      
      // Если мы не на странице настроек, но класс settings-page присутствует, значит мы в процессе перехода
      if (!currentRouteInfo.isSettings && document.body.classList.contains('settings-page')) {
        console.warn(`[Settings] Обнаружен переход со страницы настроек: ${JSON.stringify(currentRouteInfo)}`);
      }
      // Если мы на странице настроек по данным определения маршрута, но класс отсутствует
      else if (currentRouteInfo.isSettings && !document.body.classList.contains('settings-page')) {
        console.warn('[Settings] Стабилизация класса для страницы настроек');
        document.body.classList.add('settings-page');
        document.body.setAttribute('data-path', '/settings');
      }
    }, 2000); // Больший интервал для снижения нагрузки
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
};
