
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCw } from "lucide-react";

interface ConnectionStatusProps {
  connectionStatus: boolean | null;
  checkingStatus: boolean;
  onCheckConnection: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionStatus,
  checkingStatus,
  onCheckConnection
}) => {
  return (
    <div className="flex items-center">
      {connectionStatus !== null && (
        <div 
          className={`mr-2 flex items-center px-3 py-1 rounded text-xs font-medium ${
            connectionStatus 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {connectionStatus ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Подключено
            </>
          ) : (
            <>
              <X className="h-3 w-3 mr-1" />
              Не подключено
            </>
          )}
        </div>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onCheckConnection}
        disabled={checkingStatus}
        className="text-xs flex items-center"
      >
        {checkingStatus ? (
          <>
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Проверка...
          </>
        ) : (
          <>
            <RefreshCw className="mr-1 h-3 w-3" />
            Проверить соединение
          </>
        )}
      </Button>
    </div>
  );
};
