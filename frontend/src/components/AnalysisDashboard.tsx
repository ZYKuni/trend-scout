'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { AlertTriangle, TrendingUp, ThumbsUp, ThumbsDown } from "lucide-react";

export interface AnalysisData {
  productName: string;
  imageUrl: string;
  price: string;
  radarData: { subject: string; A: number; fullMark: number }[];
  painPoints: string[];
  strengths: string[];
  opportunities: string[];
}

export function AnalysisDashboard({ data }: { data: AnalysisData }) {
  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Overview & Radar Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{data.productName}</CardTitle>
            <CardDescription>{data.price}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* Placeholder for Product Image - In a real app, use next/image with a valid src */}
            <div className="w-48 h-48 bg-muted rounded-md flex items-center justify-center mb-4 overflow-hidden relative">
               {data.imageUrl ? (
                   <img src={data.imageUrl} alt={data.productName} className="object-cover w-full h-full" />
               ) : (
                   <span className="text-muted-foreground">暂无图片</span>
               )}
            </div>
            
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="产品评分"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Details */}
        <div className="space-y-6">
            {/* Pain Points */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        用户痛点 (Pain Points)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {data.painPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Opportunities */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <TrendingUp className="h-5 w-5" />
                        机会点 (Opportunities)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {data.opportunities.map((opp, index) => (
                            <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                                {opp}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

             {/* Strengths */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <ThumbsUp className="h-5 w-5" />
                        产品优势 (Strengths)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {data.strengths.map((point, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-600 flex-shrink-0" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
