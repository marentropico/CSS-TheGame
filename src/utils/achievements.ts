import { Achievement, UserProgress } from "../types";
import { achievementsData } from "../levelsData";

/**
 * Pure function that determines which achievements should be newly unlocked
 * based on the previous and next progress state.
 *
 * This is intentionally separated from the UI so it can be tested independently.
 *
 * @param nextCompleted - array of completed level IDs after the current action
 * @param previouslyUnlocked - array of achievement IDs already unlocked before this action
 * @param totalLevels - total number of levels in the game
 * @returns array of newly unlocked Achievement objects (may be empty)
 */
export const checkAchievements = (
  nextCompleted: number[],
  previouslyUnlocked: string[],
  totalLevels: number
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  const unlock = (id: string) => {
    if (!previouslyUnlocked.includes(id)) {
      const found = achievementsData.find((a) => a.id === id);
      if (found) {
        newlyUnlocked.push({ ...found, unlocked: true, unlockedAt: new Date().toISOString() });
      }
    }
  };

  // Achievement: Primeiros Passos — concluiu o Nível 1
  if (nextCompleted.includes(1)) unlock("first_steps");

  // Achievement: Mestre das Caixas — concluiu o Nível 2
  if (nextCompleted.includes(2)) unlock("box_master");

  // Achievement: Ninja do Flexbox — concluiu os Níveis 5 e 6
  if (nextCompleted.includes(5) && nextCompleted.includes(6)) unlock("flex_ninja");

  // Achievement: Arquiteto de Grelhas — concluiu o Nível 7
  if (nextCompleted.includes(7)) unlock("grid_architect");

  // Achievement: Mestre das Animações — concluiu os Níveis 9 e 10
  if (nextCompleted.includes(9) && nextCompleted.includes(10)) unlock("animator");

  // Achievement: Especialista em CSS — concluiu todos os níveis
  if (nextCompleted.length === totalLevels) unlock("css_expert");

  return newlyUnlocked;
};

/**
 * Calculates the next streak value based on current progress.
 * Streak increments only if the user hadn't already completed an action today.
 */
export const calculateNextStreak = (
  currentStreak: number,
  lastActiveDate: string
): number => {
  const todayStr = new Date().toISOString().split("T")[0];
  const lastActiveStr = lastActiveDate ? lastActiveDate.split("T")[0] : "";
  if (lastActiveStr !== todayStr) {
    return currentStreak + 1;
  }
  return currentStreak;
};

/**
 * Returns true if the streak should be reset (user skipped more than 1 day).
 */
export const shouldResetStreak = (lastActiveDate: string): boolean => {
  if (!lastActiveDate) return false;
  const todayStr = new Date().toISOString().split("T")[0];
  const lastActiveStr = lastActiveDate.split("T")[0];
  if (lastActiveStr === todayStr) return false;
  const diffTime = Math.abs(
    new Date(todayStr).getTime() - new Date(lastActiveStr).getTime()
  );
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 1;
};
