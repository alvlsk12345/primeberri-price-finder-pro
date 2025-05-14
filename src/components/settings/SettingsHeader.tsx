
import React from 'react';

export const SettingsHeader: React.FC = () => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">Настройки</h1>
      <p className="text-muted-foreground mt-2">
        Настройте ключи API и параметры подключения вашего приложения
      </p>
    </div>
  );
};
