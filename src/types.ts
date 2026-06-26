export interface Level {
  id: number;
  title: string;
  category: "Básico" | "Intermediário" | "Avançado";
  difficulty: "Fácil" | "Médio" | "Difícil";
  description: string;
  instructions: string[];
  initialHtml: string;
  initialCss: string;
  solutionCss: string; // Used for reference or "Ver Solução"
  hints: string[];
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  id: string;
  description: string;
  // A function that takes the sandbox container element and the raw CSS text and returns if it passes
  validate: (container: HTMLElement, cssText: string) => boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export type AppTheme = "retro" | "dracula" | "modern";

export interface UserProgress {
  currentLevelId: number;
  completedLevels: number[]; // Array of completed level IDs
  levelCss: { [levelId: number]: string }; // Saved CSS for each level
  unlockedAchievements: string[]; // List of achievement IDs
  xp?: number;
  streak?: number;
  hearts?: number;
  lastActiveDate?: string;
}
