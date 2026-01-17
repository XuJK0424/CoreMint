import { AppMode, AnalysisResult } from "../types";
import { MODES } from "../constants";

// DeepSeek API Configuration
const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL_NAME = "deepseek-chat"; // Points to DeepSeek-V3

export const analyzeText = async (text: string, mode: AppMode): Promise<AnalysisResult> => {
  // Use process.env.API_KEY as per project standard, but this now expects a DeepSeek Key
  const apiKey = process.env.API_KEY;
  const selectedMode = MODES[mode];

  // Since we are using the REST API, we inject the Schema definition directly into the prompt
  // to ensure the model outputs the exact JSON structure we need.
  const systemInstruction = `
    你就是 CoreMint (智核)，一个“第二大脑”知识内化引擎。
    ${selectedMode.systemInstruction}

    你的任务是分析用户输入的文本并提取结构化知识。

    【输出格式要求】：
    你必须输出一个符合以下结构的严格 JSON 对象（不要包含 markdown 代码块标记）：
    {
      "keywords": "思维导图中心关键词（5个字以内）",
      "coreInsight": "核心观点/知识锚点（最重要的单点总结）",
      "underlyingLogic": ["底层逻辑1", "底层逻辑2", "底层逻辑3"], // 数组：3-4点，解释'为什么'
      "actionableSteps": ["实操步骤1", "实操步骤2", "实操步骤3"], // 数组：3-5点具体行动
      "caseStudies": ["真实案例1", "真实案例2"] // 数组：1-2个案例或类比
    }

    【重要约束】：
    1. 无论用户输入何种语言，你的输出结果（JSON中的所有值）必须严格使用【简体中文】。
    2. 保持深刻、简洁、高智感的表达风格。
  `;

  try {
    if (!apiKey) {
      throw new Error("未找到API密钥。请配置您的 DeepSeek API Key。");
    }

    // Call DeepSeek API via fetch
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
        // DeepSeek supports json_object mode to guarantee JSON output
        response_format: { type: "json_object" }, 
        temperature: 1.3, // DeepSeek V3 recommends slightly higher temp for creative tasks
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const resultText = data.choices[0]?.message?.content;

    if (!resultText) {
      throw new Error("DeepSeek API 返回响应为空");
    }

    // Clean up potential markdown code blocks just in case
    const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson) as AnalysisResult;

  } catch (error) {
    console.error("Knowledge Smelting Error:", error);
    
    // Localized Fallback Data (Kept consistent with previous version)
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