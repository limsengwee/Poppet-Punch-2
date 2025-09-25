import type React from 'react';

export type GameState = 'disclaimer' | 'upload' | 'moderating' | 'detectingFace' | 'playing';

export type ToolName = 
  | 'Hand Slap'
  | 'Mallet'
  | 'Spider Voodoo'
  | 'Knife Scar'
  | 'Needle Voodoo'
  | 'Cowboy Hat'
  | 'Tongue Out'
  | 'Shoes Fly Off'
  | 'Classic Voodoo';

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
