
import React, { useState } from 'react';
import { isOnSettingsPage } from '@/utils/navigation';
import { GoogleApiTester, GoogleApiStatus } from './diagnostic/GoogleApiTester';
import { OpenAiTester, OpenAiStatus } from './diagnostic/OpenAiTester';
import { AiProviderInfo } from './diagnostic/AiProviderInfo';

export const DiagnosticButtons: React.FC = () => {
  const [openAiStatus, setOpenAiStatus] = useState<OpenAiStatus>('неизвестно');
  const [googleApiStatus, setGoogleApiStatus] = useState<GoogleApiStatus>('неизвестно');
  
  // Используем централизованную функцию для проверки страницы настроек
  const inSettingsPage = isOnSettingsPage();
  
  // Не рендерим компонент на странице настроек
  if (inSettingsPage) {
    console.log("DiagnosticButtons: не отображаются на странице настроек");
    return null;
  }

  return (
    <div className="pt-3 flex flex-wrap gap-2">
      <GoogleApiTester 
        googleApiStatus={googleApiStatus}
        setGoogleApiStatus={setGoogleApiStatus}
      />
      
      <OpenAiTester 
        openAiStatus={openAiStatus}
        setOpenAiStatus={setOpenAiStatus}
      />
      
      <AiProviderInfo />
    </div>
  );
};
