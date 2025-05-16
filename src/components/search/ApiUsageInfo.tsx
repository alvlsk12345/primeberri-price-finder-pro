
import React from 'react';

interface ApiUsageInfoProps {
  apiInfo: Record<string, string>;
}

export const ApiUsageInfo: React.FC<ApiUsageInfoProps> = ({ apiInfo }) => {
  if (!apiInfo || Object.keys(apiInfo).length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500 border border-gray-200">
      <h4 className="font-medium mb-1">API информация:</h4>
      <div className="grid grid-cols-2 gap-1">
        {Object.entries(apiInfo).map(([key, value]) => (
          <div key={key} className="flex">
            <span className="font-semibold mr-1">{key}:</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
