
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { testMinimalGoogleApiRequest } from '@/services/api/googleSearchService';

export type GoogleApiStatus = 'неизвестно' | 'работает' | 'ошибка';

interface GoogleApiTesterProps {
  googleApiStatus: GoogleApiStatus;
  setGoogleApiStatus: (status: GoogleApiStatus) => void;
}

export const GoogleApiTester: React.FC<GoogleApiTesterProps> = ({ 
  googleApiStatus, 
  setGoogleApiStatus 
}) => {
  const [isTestingGoogle, setIsTestingGoogle] = useState(false);

  // Тест Google API
  const testGoogleApi = async () => {
    try {
      setIsTestingGoogle(true);
      toast.loading("Тестирование Google API...");
      const result = await testMinimalGoogleApiRequest();
      
      if (result.includes('успешен')) {
        setGoogleApiStatus('работает');
        toast.success(`Тест Google API: ${result}`, { duration: 7000 });
      } else {
        setGoogleApiStatus('ошибка');
        toast.error(`Ошибка Google API: ${result}`, { duration: 7000 });
      }
    } catch (error) {
      console.error("Ошибка при тестировании Google API:", error);
      setGoogleApiStatus('ошибка');
      toast.error(`Ошибка Google API: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsTestingGoogle(false);
    }
  };

  return (
    <Button
      onClick={testGoogleApi}
      size="sm"
      variant={googleApiStatus === 'работает' ? "outline" : "secondary"}
      className={`text-xs flex items-center gap-1 ${
        googleApiStatus === 'работает' ? 'border-green-500 text-green-700' : 
        googleApiStatus === 'ошибка' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''
      }`}
      disabled={isTestingGoogle}
      type="button"
    >
      {isTestingGoogle ? (
        <>
          <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-1" />
          Тестирование...
        </>
      ) : (
        <>
          <Search size={14} />
          Тест Google API {googleApiStatus !== 'неизвестно' ? 
            `(${googleApiStatus === 'работает' ? '✓' : '✗'})` : ''}
        </>
      )}
    </Button>
  );
};
