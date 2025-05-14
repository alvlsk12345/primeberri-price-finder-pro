
import React, { useState, useEffect } from 'react';
import { getRouteInfo, getNormalizedRouteForLogging } from '@/utils/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApiStatus } from './types';

export const RouteDebugger = () => {
  const [routeInfo, setRouteInfo] = useState(getRouteInfo());
  const [refresh, setRefresh] = useState(0);
  const [routeApiStatus, setRouteApiStatus] = useState<ApiStatus>('неизвестно');

  useEffect(() => {
    const checkRoute = () => {
      try {
        const info = getRouteInfo();
        setRouteInfo(info);
        setRouteApiStatus('работает');
      } catch (error) {
        console.error('[RouteDebugger] Ошибка при получении информации о маршруте:', error);
        setRouteApiStatus('ошибка');
      }
    };

    checkRoute();
    
    // Обновляем информацию о маршруте каждую секунду
    const intervalId = setInterval(checkRoute, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refresh]);

  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
  };

  const getStatusClass = (status: ApiStatus) => {
    switch (status) {
      case 'работает': return 'text-green-600';
      case 'ошибка': return 'text-red-600';
      case 'отключено': return 'text-gray-400';
      case 'в процессе проверки': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Информация о маршруте</span>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="text-xs">
            Обновить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="grid grid-cols-2 gap-1">
          <div className="font-medium">Статус API маршрутизации:</div>
          <div className={getStatusClass(routeApiStatus)}>{routeApiStatus}</div>
          
          <div className="font-medium">Текущий путь:</div>
          <div className="font-mono">{routeInfo.path}</div>
          
          <div className="font-medium">Hash:</div>
          <div className="font-mono">{routeInfo.rawHash || 'отсутствует'}</div>
          
          <div className="font-medium">Pathname:</div>
          <div className="font-mono">{routeInfo.rawPath}</div>
          
          <div className="font-medium">data-path атрибут:</div>
          <div className="font-mono">{routeInfo.dataPath || 'отсутствует'}</div>
          
          <div className="font-medium">Страница настроек:</div>
          <div className={routeInfo.isSettings ? 'text-green-600' : 'text-red-600'}>
            {routeInfo.isSettings ? 'Да' : 'Нет'}
          </div>
          
          <div className="font-medium">Главная страница:</div>
          <div className={routeInfo.isIndex ? 'text-green-600' : 'text-red-600'}>
            {routeInfo.isIndex ? 'Да' : 'Нет'}
          </div>
          
          <div className="font-medium">Класс settings-page:</div>
          <div className={document.body.classList.contains('settings-page') ? 'text-green-600' : 'text-red-600'}>
            {document.body.classList.contains('settings-page') ? 'Присутствует' : 'Отсутствует'}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Нормализованный маршрут для логирования: <span className="font-mono">{getNormalizedRouteForLogging()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
