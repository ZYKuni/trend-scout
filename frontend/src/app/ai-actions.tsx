'use server';

import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { scrapeUrl, searchProduct } from './actions';
import { AnalysisDashboard, AnalysisData } from '@/components/AnalysisDashboard';
import { HttpsProxyAgent } from 'https-proxy-agent';
import nodeFetch from 'node-fetch';

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  // @ts-ignore
  fetch: proxyUrl && !process.env.OPENAI_BASE_URL?.includes('deepseek.com')
    ? (url, init) => {
        const agent = new HttpsProxyAgent(proxyUrl);
        // @ts-ignore
        return nodeFetch(url, { ...init, agent });
      }
    : undefined,
});

export interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  display: React.ReactNode;
}

export async function submitUserMessage(input: string) {
  'use server';

  const history = getMutableAIState();
  history.update((messages: ServerMessage[]) => [
    ...messages,
    { role: 'user', content: input },
  ]);

  try {
    const result = await streamUI({
      model: openai('deepseek-chat'),
      messages: history.get(),
      temperature: 0.1,
      system: `You are TrendScout AI, an expert e-commerce analyst.
      
      CORE INSTRUCTION:
      Whenever the user provides a product name, description, or URL, you MUST use the "analyze_product" tool.
      
      - Do NOT refuse to analyze.
      - Do NOT ask for a URL if the user provides a product name. Instead, use the product name to search via the tool.
      - Do NOT say "I cannot search". You HAVE the capability to search via the "analyze_product" tool.
      
      Example:
      User: "iPhone 15 Pro"
      Assistant: [Calls analyze_product with query="iPhone 15 Pro"]
      
      User: "https://item.taobao.com/..."
      Assistant: [Calls analyze_product with query="https://item.taobao.com/..."]
      `,
      text: ({ content, done }) => {
        if (done) {
          history.done((messages: ServerMessage[]) => [
            ...messages,
            { role: 'assistant', content },
          ]);
        }
        return <div>{content}</div>;
      },
      tools: {
        analyze_product: {
          description: 'Analyze a product. If the input is a URL, analyze the content of that URL. If the input is a product name or description, search for it and then analyze the results. ALWAYS use this tool for product queries.',
          parameters: z.object({
            query: z.string().describe('Product URL or Product Name to search/analyze'),
          }),
          generate: async ({ query }) => {
            const isUrl = query.startsWith('http');
            
             history.done((messages: ServerMessage[]) => [
              ...messages,
              { role: 'assistant', content: isUrl ? `正在分析商品：${query}...` : `正在全网搜索商品评价：${query}...` },
            ]);

            try {
              let combinedMarkdown = '';

              if (isUrl) {
                combinedMarkdown = await scrapeUrl(query);
              } else {
                const searchResults = await searchProduct(query);
                // Combine results from multiple sources
                combinedMarkdown = searchResults.map((r: any, index: number) => 
                    `### 来源 ${index + 1}: ${r.title} (${r.url})\n\n${r.markdown}\n\n---\n`
                ).join('\n');
              }
              
              const analysis = await streamUI({
                  model: openai('deepseek-chat'),
                  system: `你是一位专业的电商数据分析师。请分析提供的商品信息（可能来自多个网页来源），并返回一个符合以下结构的 JSON 对象：
                  {
                    "productName": "商品名称",
                    "imageUrl": "商品图片URL (如果内容中有则提取，否则留空)",
                    "price": "价格 (如果有多个价格，取最常见的或范围)",
                    "radarData": [
                      { "subject": "价格", "A": 80, "fullMark": 100 },
                      { "subject": "质量", "A": 90, "fullMark": 100 },
                      { "subject": "功能", "A": 70, "fullMark": 100 },
                      { "subject": "耐用性", "A": 85, "fullMark": 100 },
                      { "subject": "设计", "A": 75, "fullMark": 100 }
                    ],
                    "painPoints": ["痛点 1", "痛点 2"],
                    "strengths": ["优势 1", "优势 2"],
                    "opportunities": ["机会点 1", "机会点 2"]
                  }
                  
                  对于 radarData (雷达图数据)，请根据商品评论和描述，针对该品类的 5-6 个关键维度生成真实的评分 (0-100)。
                  painPoints (痛点)、strengths (优势) 和 opportunities (机会点) 请用简体中文总结。
                  如果提供的来源中包含无关信息（如登录页、分类页），请忽略它们，只关注具体的商品详情和用户评价。
                  请确保返回的是严格合法的 JSON 格式。`,
                  messages: [
                      { role: 'user', content: `这是搜集到的商品信息：\n\n${combinedMarkdown}\n\n请进行分析并生成仪表盘数据。`}
                  ],
                  text: ({ content, done }) => {
                      if (done) {
                           try {
                              // Attempt to parse JSON if completed text looks like JSON
                              // This is a fallback if the tool call doesn't work as expected or for simple text responses
                               const cleanContent = content.replace(/```json/g, '').replace(/```/g, '');
                               const data = JSON.parse(cleanContent);
                               return <AnalysisDashboard data={data} />;
                           } catch (e) {
                               return <div>{content}</div>;
                           }
                      }
                      return <div>正在分析中...</div>
                  },
                  tools: {
                      generate_dashboard: {
                          description: '生成带有分析数据的仪表盘',
                          parameters: z.object({
                              productName: z.string(),
                              imageUrl: z.string().optional(),
                              price: z.string().optional(),
                              radarData: z.array(z.object({
                                  subject: z.string(),
                                  A: z.number(),
                                  fullMark: z.number()
                              })),
                              painPoints: z.array(z.string()),
                              strengths: z.array(z.string()),
                              opportunities: z.array(z.string())
                          }),
                          generate: async (data) => {
                              return <AnalysisDashboard data={data as any} />;
                          }
                      }
                  }
              });

              return analysis.value;
            } catch (error) {
              console.error('Analysis error:', error);
              return <div>分析过程中发生错误，请稍后再试。详细错误: {error instanceof Error ? error.message : String(error)}</div>;
            }
          },
        },
      },
    });

    return result.value;
  } catch (error) {
    console.error('StreamUI Error:', error);
    return <div>AI 服务暂时不可用。错误信息: {error instanceof Error ? error.message : String(error)}</div>;
  }
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    submitUserMessage,
  },
  initialAIState: [],
  initialUIState: [],
});
