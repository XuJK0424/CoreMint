export enum AppMode {
  COACH = 'COACH',
  ENCOURAGE = 'ENCOURAGE',
  TOXIC = 'TOXIC'
}

export interface AnalysisResult {
  keywords: string;       // For MindMap Center
  coreInsight: string;    // Knowledge Anchor
  underlyingLogic: string[]; // The "Why"
  actionableSteps: string[]; // The "How"
  caseStudies: string[];     // Real examples or analogies
}

export interface ModeConfig {
  id: AppMode;
  label: string;
  color: string;
  description: string;
  systemInstruction: string;
}

// --- Knowledge Library Types ---

export interface KnowledgeItem extends AnalysisResult {
  id: string;             // UUID
  timestamp: number;      // Created time
  tags: string[];         // Max 3 tags. Primary tag comes from keywords
  personalMemo: string;   // Editable field
  formattedDate: string;  // YYYY-MM-DD HH:mm:ss
}

export type LibraryStorage = KnowledgeItem[];
