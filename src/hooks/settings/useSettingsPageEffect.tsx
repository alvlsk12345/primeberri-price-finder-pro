
import { useEffect } from 'react';
import { getRouteInfo } from '@/utils/navigation';

export const useSettingsPageEffect = () => {
  // Устанавливаем атрибут data-path в body при монтировании компонента
  useEffect(() => {
    console.log('[Settings] useEffect - устанавливаем data-path /settings');
    
    // Сначала проверяем, что мы действительно на странице настроек
    const routeInfo = getRouteInfo();
    console.log(`[Settings] useSettingsPageEffect - текущий маршрут: ${JSON.stringify(routeInfo)}`);
    
    // Для предотвращения конфликтов проверяем, не имеет ли body уже класс settings-page
    const hasSettingsClass = document.body.classList.contains('settings-page');
    
    if (!hasSettingsClass) {
      // Добавляем класс settings-page на body (высокий приоритет для определения маршрута)
      console.log('[Settings] useSettingsPageEffect - добавляем класс settings-page');
      document.body.classList.add('settings-page');
      
      // Устанавливаем data-path как запасной вариант
      document.body.setAttribute('data-path', '/settings');
      console.log('[Settings] useSettingsPageEffect - установлен data-path=/settings');
    } else {
      console.log('[Settings] useSettingsPageEffect - класс settings-page уже установлен');
    }
    
    // Очистка при размонтировании
    return () => {
      console.log('[Settings] useEffect - начало очистки при размонтировании');
      
      // Проверяем, что мы все еще на странице настроек перед удалением атрибута
      const currentRouteInfo = getRouteInfo();
      console.log(`[Settings] useSettingsPageEffect - размонтирование, текущий маршрут: ${JSON.stringify(currentRouteInfo)}`);
      
      // Если мы точно ушли со страницы настроек
      if (!currentRouteInfo.hash || (currentRouteInfo.hash && !currentRouteInfo.hash.includes('settings'))) {
        console.log('[Settings] useSettingsPageEffect - удаляем класс settings-page и атрибут data-path');
        document.body.classList.remove('settings-page');
        document.body.removeAttribute('data-path');
      } else {
        console.log('[Settings] useSettingsPageEffect - сохраняем класс и атрибут, так как все еще на странице настроек');
      }
      
      console.log('[Settings] useEffect - завершение очистки при размонтировании');
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
