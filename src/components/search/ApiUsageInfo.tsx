import React from 'react';
import { useSearch } from "@/contexts/SearchContext";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export const ApiUsageInfo: React.FC = () => {
  const {
    searchResults,
    apiInfo
  } = useSearch();
  if (!apiInfo || !Object.keys(apiInfo).length) {
    return null;
  }
  const monthlyRemaining = apiInfo['X-Zyla-API-Calls-Monthly-Remaining'] || 'N/A';
  const monthlyLimit = apiInfo['X-Zyla-RateLimit-Limit'] || 'N/A';
  const dailyRemaining = apiInfo['X-Zyla-API-Calls-Daily-Remaining'] || 'N/A';
  return <Card className="mb-4 bg-slate-50 border-slate-200">
      
    </Card>;
};