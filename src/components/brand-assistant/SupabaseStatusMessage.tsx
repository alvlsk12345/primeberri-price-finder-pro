
import React from 'react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type SupabaseStatusMessageProps = {
  connected: boolean;
  enabled: boolean;
  onRequestCheck: () => Promise<void>;
};

export const SupabaseStatusMessage: React.FC<SupabaseStatusMessageProps> = ({
  connected,
  enabled,
  onRequestCheck
}) => {
  // Если не включено или отключено - не показываем сообщение
  if (!enabled) {
    return null;
  }

  return (
    <div className="mt-2 text-sm">
      {!connected && (
        <div className="flex items-start space-x-2 p-2 bg-amber-50 text-amber-900 border border-amber-200 rounded-md">
          <InfoIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p>
              Соединение с Supabase не установлено. Некоторые функции могут быть недоступны.
            </p>
            <div className="mt-2 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                onClick={() => onRequestCheck()}
              >
                Проверить соединение
              </Button>
              <Link to="/settings">
                <Button size="sm" variant="link" className="text-xs px-0">
                  Перейти в настройки
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
