
import React from 'react';
import { useSearch } from "@/contexts/SearchContext";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ApiUsageInfo: React.FC = () => {
  const { searchResults, apiInfo } = useSearch();
  
  if (!apiInfo || !Object.keys(apiInfo).length) {
    return null;
  }
  
  const monthlyRemaining = apiInfo['X-Zyla-API-Calls-Monthly-Remaining'] || 'N/A';
  const monthlyLimit = apiInfo['X-Zyla-RateLimit-Limit'] || 'N/A';
  const dailyRemaining = apiInfo['X-Zyla-API-Calls-Daily-Remaining'] || 'N/A';
  
  return (
    <Card className="mb-4 bg-slate-50 border-slate-200">
      <CardContent className="pt-4">
        <CardTitle className="text-sm font-medium">Информация об использовании API</CardTitle>
        <CardDescription className="text-xs">
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-white">
              Осталось запросов: {monthlyRemaining}
            </Badge>
            <Badge variant="outline" className="bg-white">
              Лимит запросов: {monthlyLimit}
            </Badge>
            {dailyRemaining && (
              <Badge variant="outline" className="bg-white">
                Осталось сегодня: {dailyRemaining}
              </Badge>
            )}
          </div>
        </CardDescription>
      </CardContent>
    </Card>
  );
};
