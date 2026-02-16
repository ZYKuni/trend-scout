'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, MessageSquare, History } from "lucide-react";
import { useState } from "react";
import { useUIState } from "ai/rsc";
import { ClientMessage } from "@/app/ai-actions";
import { AnalysisDashboard, AnalysisData } from "@/components/AnalysisDashboard";

// Mock Data for History
const MOCK_HISTORY = [
  {
    id: "1",
    title: "Sony WH-1000XM5 分析报告",
    date: "2024-05-20",
    data: {
        productName: "Sony WH-1000XM5",
        imageUrl: "https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_SL1000_.jpg",
        price: "$348.00",
        radarData: [
            { subject: "价格", A: 70, fullMark: 100 },
            { subject: "质量", A: 95, fullMark: 100 },
            { subject: "功能", A: 90, fullMark: 100 },
            { subject: "耐用性", A: 85, fullMark: 100 },
            { subject: "设计", A: 80, fullMark: 100 }
        ],
        painPoints: ["价格昂贵", "触摸控制有时过于灵敏"],
        strengths: ["行业领先的降噪效果", "佩戴舒适", "电池续航出色"],
        opportunities: ["增加更多颜色选择", "改进 App 集成体验"]
    }
  },
  {
    id: "2",
    title: "Dyson Airwrap 测评",
    date: "2024-05-18",
    data: {
        productName: "Dyson Airwrap Multi-styler",
        imageUrl: "https://m.media-amazon.com/images/I/71L5lQ+KkOL._AC_SL1500_.jpg",
        price: "$599.99",
        radarData: [
            { subject: "价格", A: 60, fullMark: 100 },
            { subject: "质量", A: 98, fullMark: 100 },
            { subject: "功能", A: 95, fullMark: 100 },
            { subject: "耐用性", A: 90, fullMark: 100 },
            { subject: "设计", A: 95, fullMark: 100 }
        ],
        painPoints: ["非常昂贵", "学习曲线较高"],
        strengths: ["造型多变", "不伤发", "做工精良"],
        opportunities: ["推出便携旅行版", "增加更多配件选项"]
    }
  }
];

export function Sidebar() {
  const [messages, setMessages] = useUIState();

  const loadHistory = (item: any) => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        display: <AnalysisDashboard data={item.data} />
      }
    ]);
  };

  return (
    <div className="flex h-screen w-full flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="">TrendScout</span>
        </Link>
        <Button variant="outline" size="icon" className="ml-auto h-8 w-8" onClick={() => setMessages([])}>
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">新建对话</span>
        </Button>
      </div>

      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground">
            <History className="h-4 w-4" />
            历史记录 (模拟数据)
          </div>
          <Separator className="my-2" />
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <div className="flex flex-col gap-2 p-2">
              {MOCK_HISTORY.map((item) => (
                <Button 
                    key={item.id} 
                    variant="ghost" 
                    className="justify-start font-normal w-full truncate"
                    onClick={() => loadHistory(item)}
                >
                  <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
         <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="@user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">User</span>
              <span className="text-xs text-muted-foreground">user@example.com</span>
            </div>
         </div>
      </div>
    </div>
  );
}
