
import React from 'react';
import { Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApiKey } from './ApiKeyContext';

export const ApiKeyFormError: React.FC = () => {
  const { error, setError, keyTitle } = useApiKey();
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Key size={18} /> Настройки {keyTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-red-50 rounded-md text-red-600">
          {error}
          <Button 
            onClick={() => setError(null)} 
            variant="outline" 
            size="sm"
            className="mt-2"
          >
            Попробовать снова
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
