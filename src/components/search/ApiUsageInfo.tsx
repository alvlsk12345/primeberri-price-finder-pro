
import React from 'react';
import { useSearch } from "@/contexts/SearchContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export const ApiUsageInfo: React.FC = () => {
  const {
    searchResults,
    apiInfo,
    currentPage,
    totalPages
  } = useSearch();
  
  if (!apiInfo || !Object.keys(apiInfo).length) {
    return null;
  }
  
  const monthlyRemaining = apiInfo['X-Zyla-API-Calls-Monthly-Remaining'] || apiInfo['totalGerman'] || 'N/A';
  const monthlyLimit = apiInfo['X-Zyla-RateLimit-Limit'] || apiInfo['totalProducts'] || 'N/A';
  const dailyRemaining = apiInfo['X-Zyla-API-Calls-Daily-Remaining'] || apiInfo['totalOtherEu'] || 'N/A';
  
  return (
    <Card className="mb-4 bg-slate-50 border-slate-200">
      <CardContent className="p-3 flex items-center gap-2">
        <Info size={16} className="text-blue-500 flex-shrink-0" />
        <div className="flex-grow text-sm">
          <div className="font-medium">Информация о API</div>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline" className="bg-white">
              Найдено товаров: {searchResults.length}
            </Badge>
            {monthlyRemaining !== 'N/A' && (
              <Badge variant="outline" className="bg-white">
                Из Германии: {monthlyRemaining}
              </Badge>
            )}
            {dailyRemaining !== 'N/A' && (
              <Badge variant="outline" className="bg-white">
                Из других стран: {dailyRemaining}
              </Badge>
            )}
            {totalPages > 1 && (
              <Badge variant="outline" className="bg-white">
                Страница {currentPage} из {totalPages}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
