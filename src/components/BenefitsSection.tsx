
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BenefitsSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Cards with equal height using h-full */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Benefit 1</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Description of benefit 1</p>
        </CardContent>
      </Card>
      
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Benefit 2</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Description of benefit 2</p>
        </CardContent>
      </Card>
      
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Benefit 3</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Description of benefit 3</p>
        </CardContent>
      </Card>
    </div>
  );
};
