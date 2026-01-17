import { AppMode, ModeConfig, AnalysisResult } from './types';

export const MODES: Record<AppMode, ModeConfig> = {
  [AppMode.COACH]: {
    id: AppMode.COACH,
    label: '教官模式',
    color: 'bg-red-500',
    description: 'Strict, military-style discipline.',
    systemInstruction: 'You are a strict military coach. Be direct, commanding, and no-nonsense. Focus on discipline and execution.'
  },
  [AppMode.ENCOURAGE]: {
    id: AppMode.ENCOURAGE,
    label: '鼓励模式',
    color: 'bg-green-500',
    description: 'Warm, empathetic support.',
    systemInstruction: 'You are a supportive therapist. Be warm, empathetic, and encouraging. Focus on emotional well-being and positive reinforcement.'
  },
  [AppMode.TOXIC]: {
    id: AppMode.TOXIC,
    label: '毒舌模式',
    color: 'bg-slate-900',
    description: 'Cynical, high-standard critique.',
    systemInstruction: 'You are a toxic, cynical intellectual with impossibly high standards. Roast the input text while analyzing it. Be sharp, witty, and brutally honest. Use dark humor.'
  }
};

export const INITIAL_INPUT = `（用户已粘贴了一段关于时间管理的视频文案...）
其实很多人觉得时间不够用，本质上不是因为事情多，而是因为心里不想做。拖延症的本质是恐惧，是对结果的不可控感到害怕。你刷短视频不是因为快乐，而是因为焦虑。`;

export const INITIAL_RESULT: AnalysisResult = {
  keywords: "拖延症 = 结果恐惧",
  coreInsight: "拖延症的本质不是懒惰，而是对“结果不可控”的恐惧。所谓的忙碌，往往是掩盖低效的遮羞布。",
  underlyingLogic: [
    "恐惧机制：大脑为了避免潜在的失败（负面反馈），选择逃避开始。",
    "多巴胺陷阱：刷短视频是低成本获取多巴胺的手段，用来对抗内心的焦虑感，而非真实的快乐。",
    "完美主义陷阱：'不做'就不会'做错'，这是一种病态的自我保护。"
  ],
  actionableSteps: [
    "微量开始法：也就是现在，立刻做5分钟。降低启动门槛。",
    "环境隔离：手机静音并扔到视线外，物理隔绝多巴胺诱惑。",
    "完成大于完美：先做出一坨垃圾，再修改它，好过一张白纸。"
  ],
  caseStudies: [
    "海明威法则：每次写作在写得最顺的时候停笔，留一点'引子'给第二天，降低再次启动的恐惧。",
    "（反面案例）：为了写完美的PPT，花3小时找模板，最后正文一个字没写。"
  ]
};