'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useState } from "react";
import { useActions, useUIState } from "ai/rsc";
import type { AI } from "@/app/ai-actions";

export function ChatArea() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>() as { submitUserMessage: (input: string) => Promise<any> };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message to UI
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now().toString(),
        role: 'user',
        display: inputValue,
      },
    ]);

    const value = inputValue;
    setInputValue("");

    try {
      const response = await submitUserMessage(value);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          display: response
        },
      ]);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
        <h1 className="text-lg font-semibold">新分析</h1>
      </header>
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {messages.length === 0 && (
             <div className="flex items-start gap-4">
             <Avatar>
               <AvatarFallback>AI</AvatarFallback>
             </Avatar>
             <div className="grid gap-1">
               <div className="font-semibold">TrendScout AI</div>
               <div className="text-sm text-muted-foreground">
                 你好！请输入商品链接，开始分析竞品和趋势。
               </div>
             </div>
           </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <Avatar>
                <AvatarFallback>{msg.role === 'user' ? '我' : 'AI'}</AvatarFallback>
              </Avatar>
              <div className={`grid gap-1 ${msg.role === 'user' ? 'text-right' : ''} w-full`}>
                <div className="font-semibold">{msg.role === 'user' ? '你' : 'TrendScout AI'}</div>
                <div className={`text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground p-3 rounded-lg text-left inline-block' : 'text-muted-foreground'}`}>
                  {msg.display}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-4 max-w-3xl mx-auto">
          <Input 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入商品链接或提问..." 
            className="flex-1" 
          />
          <Button type="submit">
            <Send className="h-4 w-4 mr-2" />
            分析
          </Button>
        </form>
      </div>
    </div>
  );
}
