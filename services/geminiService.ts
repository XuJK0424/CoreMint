import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, AnalysisResult } from "../types";
import { MODES } from "../constants";

export const analyzeText = async (text: string, mode: AppMode): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  const selectedMode = MODES[mode];

  // Define the schema with CHINESE descriptions to guide the model better
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      keywords: { 
        type: Type.STRING, 
        description: "思维导图中心关键词（5个字以内）" 
      },
      coreInsight: { 
        type: Type.STRING, 
        description: "核心观点/知识锚点（最重要的单点总结）" 
      },
      underlyingLogic: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "底层逻辑/第一性原理（3-4点，解释'为什么'）"
      },
      actionableSteps: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "实操步骤/SOP（3-5点具体行动）"
      },
      caseStudies: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "真实案例或类比（1-2个）"
      }
    },
    required: ["keywords", "coreInsight", "underlyingLogic", "actionableSteps", "caseStudies"]
  };

  try {
    if (!apiKey) {
      throw new Error("未找到API密钥。请配置您的 Google API Key。");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Explicitly enforce Chinese output in the system instruction
    const systemInstruction = `
      你就是 CoreMint (智核)，一个“第二大脑”知识内化引擎。
      ${selectedMode.systemInstruction}
      
      你的任务是分析用户输入的文本并提取结构化知识。
      
      【重要约束】：
      1. 无论用户输入何种语言，你的输出结果（JSON中的所有值）必须严格使用【简体中文】。
      2. 保持深刻、简洁、高智感的表达风格。
    `;

    // Use the latest flash model for fast text analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const resultText = response.text;
    
    if (!resultText) {
      throw new Error("Gemini API 返回响应为空");
    }

    // The SDK with responseSchema guarantees valid JSON text output
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Knowledge Smelting Error:", error);
    
    // Localized Fallback Data
    const fallbackTitle = mode === AppMode.TOXIC ? "API 拒绝工作 (你玩坏了)" : "模拟模式";
    const fallbackInsight = mode === AppMode.TOXIC 
      ? "API 拒绝了请求。可能是因为你的 API Key 无效。这是一段嘲讽性质的模拟数据。"
      : "我们检测到连接异常，但为了保证体验，系统已自动切换至离线模拟演示模式。";

    return {
      keywords: "连接已断开",
      coreInsight: fallbackInsight,
      underlyingLogic: [
        "认证错误：提供的 API 密钥可能无效、缺失或额度已耗尽。",
        "系统韧性：为了保障用户体验，CoreMint 已自动降级为离线模拟状态。",
        "操作建议：请检查代码中的环境变量 (process.env.API_KEY) 配置。"
      ],
      actionableSteps: [
        "验证密钥：确保您使用的是有效的 Google GenAI API Key。",
        "检查网络：确认您的设备已连接互联网且能访问 Google 服务。",
        "稍后重试：这可能只是临时的服务波动，请喝杯咖啡再试。"
      ],
      caseStudies: [
        "前端架构中的 '离线优先 (Offline First)' 策略。",
        "工程设计中的 '优雅降级 (Graceful Degradation)' 模式。"
      ]
    };
  }
};