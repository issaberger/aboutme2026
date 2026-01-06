export type PaletteName = 'NEON_RAIN' | 'ACID_JUNGLE' | 'VIOLET_CIRCUIT' | 'RED_ALERT' | 'BLUE_ICE';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  panel: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string; // Short description
  problem: string;
  actions: string[];
  tools: string[];
  outcome: string;
  image?: string;
  link?: string; // URL for live demo
  stats?: { label: string; value: string }[];
}

export interface Job {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string[];
}

export interface Service {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export enum SoundType {
  HOVER,
  CLICK,
  BOOT,
  ERROR,
  SUCCESS
}