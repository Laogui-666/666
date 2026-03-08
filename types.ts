
export enum TaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum TranslationType {
  NORMAL = 'NORMAL',
  CERTIFIED = 'CERTIFIED'
}

export enum ServiceType {
  GATEWAY = 'GATEWAY',
  TRANSLATION = 'TRANSLATION',
  ITINERARY = 'ITINERARY',
  FORM_FILLING = 'FORM_FILLING',
  VISA_ASSESSMENT = 'VISA_ASSESSMENT'
}

export interface TranslationTask {
  id: string;
  fileName: string;
  fileType: string;
  status: TaskStatus;
  type?: TranslationType;
  progress: number;
  resultUrl?: string;
  error?: string;
  originalFile?: File;
  completedAt?: number; 
}

export interface ProcessingStep {
  label: string;
  percentage: number;
}

export const PROCESSING_STEPS: ProcessingStep[] = [
  { label: '正在安全上传...', percentage: 10 },
  { label: '智能 OCR 内容识别中...', percentage: 30 },
  { label: '神经网络高质量翻译中...', percentage: 60 },
  { label: '智能排版还原中...', percentage: 80 },
  { label: '正在生成结果文件...', percentage: 95 },
  { label: '即将完成，请耐心等待...', percentage: 99 },
  { label: '准备就绪', percentage: 100 },
];

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string; 
  mobile: string;
  isLoggedIn: boolean;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'IDENTITY' | 'FINANCE' | 'EMPLOYMENT' | 'RELATIONSHIP' | 'TRAVEL';
  matchCriteria: {
    keywords: string[];
    anchorText: string[]; // 固定不变的锚点文本
    layoutFeatures: string[]; // 空间特征描述
    layoutDescription: string;
    requiredFields: string[];
  };
  html: string;
}
