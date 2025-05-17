
import React from 'react';

interface DemoModeAlertProps {
  isDemoMode: boolean;
}

export const DemoModeAlert: React.FC<DemoModeAlertProps> = ({ isDemoMode }) => {
  if (!isDemoMode) return null;
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 text-sm text-yellow-800">
      <p className="font-medium">Демо-режим активирован</p>
      <p className="mt-1">В демо-режиме некоторые результаты могут быть заменены тестовыми данными.</p>
    </div>
  );
};
