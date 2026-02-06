export interface TargetInfo {
  age: string;
  persona: string;
  mainConcern: string;
}

export interface ProtagonistInfo {
  name: string;
  age: string;
  job: string;
  appearance: string;
  hairProblem: string;
}

export interface SlideData {
  id: number;
  title: string;
  composition: string;
  characters: string;
  dialogue: string;
  narration?: string;
  emotion: string;
  imagePrompt: string;
}

export interface StoryData {
  target: TargetInfo;
  protagonist: ProtagonistInfo;
  slides: SlideData[];
}

export interface SalonInfo {
  name: string;
  strengths: string[];
  features: string[];
  staffImage?: string; // base64
  salonImage?: string; // base64
}

export type AppStep = 'input' | 'generating' | 'result';
