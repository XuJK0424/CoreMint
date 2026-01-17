import { AppMode, AnalysisResult } from "../types";
import { MODES } from "../constants";

// DeepSeek API Configuration
// Endpoint: https://api.deepseek.com/v1/chat/completions
const API_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL_NAME = "deepseek-chat"; // DeepSeek V3

export const analyzeText = async (text: string, mode: AppMode): Promise<AnalysisResult> => {
  const selectedMode = MODES[mode];
  
  // Try to get key from Vite env first, then fallback to process.env
  // Note: user needs to add VITE_DEEPSEEK_API_KEY to their .env file
  // @ts-ignore
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;

  // Prompt Engineering: Ensure JSON output
  const systemInstruction = `
    你就是 CoreMint (智核)，一个“第二大脑”知识内化引擎。
    ${selectedMode.systemInstruction}

    你的任务是分析用户输入的文本并提取结构化知识。

    【输出格式要求】：
    你必须输出一个符合以下结构的严格 JSON 对象（不要包含 markdown 代码块标记，不要用 \`\`\`json 包裹）：
    {
      "keywords": "思维导图中心关键词（5个字以内）",
      "coreInsight": "核心观点/知识锚点（最重要的单点总结）",
      "underlyingLogic": ["底层逻辑1", "底层逻辑2", "底层逻辑3"],
      "actionableSteps": ["实操步骤1", "实操步骤2", "实操步骤3"],
      "caseStudies": ["真实案例1", "真实案例2"]
    }

    【重要约束】：
    1. 无论用户输入何种语言，你的输出结果（JSON中的所有值）必须严格使用【简体中文】。
    2. 保持深刻、简洁、高智感的表达风格。
  `;

  try {
    if (!apiKey) {
      throw new Error("未找到 API 密钥。请配置 VITE_DEEPSEEK_API_KEY。");
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: text }
        ],
        // DeepSeek supports 'json_object' to enforce valid JSON
        response_format: { type: "json_object" },
        temperature: 1.3, // DeepSeek V3 recommends slightly higher temp for creativity
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API Error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const resultText = data.choices[0]?.message?.content;

    if (!resultText) {
      throw new Error("DeepSeek API 返回响应为空");
    }

    // Safety cleanup just in case the model returns markdown code blocks despite instructions
    const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson) as AnalysisResult;

  } catch (error) {
    console.error("Knowledge Smelting Error:", error);
    
    // Fallback Logic (Preserved from original)
    const fallbackTitle = mode === AppMode.TOXIC ? "API 拒绝工作 (你玩坏了)" : "模拟模式";
    const fallbackInsight = mode === AppMode.TOXIC 
      ? "API 拒绝了请求。可能是因为你的 API Key 无效。这是一段嘲讽性质的模拟数据。"
      : "我们检测到连接异常，但为了保证体验，系统已自动切换至离线模拟演示模式。";

    return {
      keywords: "连接已断开",
      coreInsight: fallbackInsight,
      underlyingLogic: [
        "认证错误：提供的 DEEPSEEK_API_KEY 可能无效、缺失或额度已耗尽。",
        "系统韧性：为了保障用户体验，CoreMint 已自动降级为离线模拟状态。",
        "操作建议：请检查 .env 文件中的 VITE_DEEPSEEK_API_KEY 配置。"
      ],
      actionableSteps: [
        "验证密钥：确保您使用的是有效的 DeepSeek API Key。",
        "检查网络：确认您的设备已连接互联网。",
        "稍后重试：这可能只是临时的服务波动，请喝杯咖啡再试。"
      ],
      caseStudies: [
        "前端架构中的 '离线优先 (Offline First)' 策略。",
        "工程设计中的 '优雅降级 (Graceful Degradation)' 模式。"
      ]
    };
  }
};