import React from 'react';
interface ApiUsageInfoProps {
  apiInfo: Record<string, string>;
}
export const ApiUsageInfo: React.FC<ApiUsageInfoProps> = ({
  apiInfo
}) => {
  if (!apiInfo || Object.keys(apiInfo).length === 0) {
    return null;
  }
  return;
};