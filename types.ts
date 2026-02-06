export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface TemplateState {
  html: string;
  isGenerating: boolean;
  error: string | null;
}

export enum ViewMode {
  SPLIT = 'SPLIT',
  PREVIEW = 'PREVIEW',
  CODE = 'CODE'
}