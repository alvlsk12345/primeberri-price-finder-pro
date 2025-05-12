
import React from "react";
import { AlertCircle } from "lucide-react";

interface BrandAssistantErrorProps {
  errorMessage: string;
}

export const BrandAssistantError: React.FC<BrandAssistantErrorProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;
  
  return (
    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
      <div className="flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        <div>{errorMessage}</div>
      </div>
    </div>
  );
};
