import type React from 'react';

export type GameState = 'disclaimer' | 'upload' | 'moderating' | 'detectingFace' | 'playing';

export type ToolName = 
  | '手拍'
  | '木槌'
  | '蜘蛛巫毒'
  | '刀疤'
  | '针刺巫毒'
  | '牛仔帽'
  | '吐舌头'
  | '鞋子飞走'
  | '经典巫毒';

export interface Tool {
  name: ToolName;
  icon: React.ReactNode;
  prompt: string;
  cost: number;
}

export interface Milestone {
  name: string;
  hitsRequired: number;
}

export interface FaceBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SlapMark {
    id: number;
    x: number;
    y: number;
    rotation: number;
}