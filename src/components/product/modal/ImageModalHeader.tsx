
import React, { useEffect, useState } from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isUsingSupabaseBackend } from "@/services/api/supabase/config";
import { isSupabaseConnected } from "@/services/api/supabase/client";

interface ImageModalHeaderProps {
  productTitle: string;
}

export const ImageModalHeader: React.FC<ImageModalHeaderProps> = ({ productTitle }) => {
  const [connectionMode, setConnectionMode] = useState<string>('прямое соединение');
  
  // Эффект для определения режима соединения
  useEffect(() => {
    async function checkConnectionMode() {
      if (isUsingSupabaseBackend() && await isSupabaseConnected()) {
        setConnectionMode('Supabase backend');
      } else {
        setConnectionMode('прямое соединение');
      }
    }
    
    checkConnectionMode();
  }, []);
  
  return (
    <DialogHeader className="space-y-1">
      <DialogTitle>{productTitle}</DialogTitle>
      <div className="text-xs text-gray-500">
        Изображение товара 
        <span className="text-xs text-gray-400 ml-2">
          режим: {connectionMode}
        </span>
      </div>
    </DialogHeader>
  );
};
