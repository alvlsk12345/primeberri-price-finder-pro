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
  return <Card className="mb-4 bg-slate-50 border-slate-200">
      
    </Card>;
};