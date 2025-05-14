
import React from 'react';
import { Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiKey } from './ApiKeyContext';

export const ApiKeyFormLoading: React.FC = () => {
  const { keyTitle } = useApiKey();
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Key size={18} /> Настройки {keyTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </CardContent>
    </Card>
  );
};
