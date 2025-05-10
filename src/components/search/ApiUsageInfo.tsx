
import React from 'react';
import { useSearch } from "@/contexts/SearchContext";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export const ApiUsageInfo: React.FC = () => {
  const {
    searchResults,
    apiInfo
  } = useSearch();
  
  if (!apiInfo || !Object.keys(apiInfo).length) {
    return null;
  }
  
  const monthlyRemaining = apiInfo['X-Zyla-API-Calls-Monthly-Remaining'] || apiInfo['totalGerman'] || 'N/A';
  const monthlyLimit = apiInfo['X-Zyla-RateLimit-Limit'] || apiInfo['totalProducts'] || 'N/A';
  const dailyRemaining = apiInfo['X-Zyla-API-Calls-Daily-Remaining'] || apiInfo['totalOtherEu'] || 'N/A';
  
  return (
    <Card className="mb-4 bg-slate-50 border-slate-200">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Info size={16} className="text-blue-500" />
            <span>Информация API:</span>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-white">
              Германия: {monthlyRemaining}
            </Badge>
            <Badge variant="outline" className="bg-white">
              ЕС: {dailyRemaining}
            </Badge>
            <Badge variant="outline" className="bg-white">
              Всего: {monthlyLimit}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
