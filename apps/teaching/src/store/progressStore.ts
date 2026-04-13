import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Progress, LessonProgress } from '../types/profile';
import type { QuizResult } from '../types/quiz';
import { ORDERED_LESSONS, LESSONS_BY_ID } from '../data/topics';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function defaultProgress(profileId: string): Progress {
  return {
    profileId,
    totalXP: 0,
    streak: 0,
    lastActivityDate: '',
    lessonProgress: {},
    unlockedLessons: [ORDERED_LESSONS[0]?.id ?? ''],
  };
}

interface ProgressStore {
  progressByProfile: Record<string, Progress>;
  // Actions
  getProgress: (profileId: string) => Progress;
  applyQuizResult: (result: QuizResult) => void;
  ensureProfileProgress: (profileId: string) => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progressByProfile: {},

      getProgress(profileId) {
        return get().progressByProfile[profileId] ?? defaultProgress(profileId);
      },

      ensureProfileProgress(profileId) {
        set((s) => {
          if (s.progressByProfile[profileId]) return s;
          return {
            progressByProfile: {
              ...s.progressByProfile,
              [profileId]: defaultProgress(profileId),
            },
          };
        });
      },

      applyQuizResult(result) {
        const { lessonId, profileId, xpEarned, stars } = result;
        set((s) => {
          const prev = s.progressByProfile[profileId] ?? defaultProgress(profileId);
          const today = todayISO();

          // Streak logic — compare ISO date strings, never timestamps
          let newStreak = prev.streak;
          if (prev.lastActivityDate === '') {
            newStreak = 1;
          } else if (prev.lastActivityDate === today) {
            // same day — no change
          } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayISO = yesterday.toISOString().slice(0, 10);
            newStreak = prev.lastActivityDate === yesterdayISO ? prev.streak + 1 : 1;
          }

          // Only improve stars, never regress
          const existingStars = prev.lessonProgress[lessonId]?.stars ?? 0;
          const newStars = Math.max(existingStars, stars) as 0 | 1 | 2 | 3;

          const updatedLessonProgress: Record<string, LessonProgress> = {
            ...prev.lessonProgress,
            [lessonId]: {
              lessonId,
              stars: newStars,
              completedAt: Date.now(),
            },
          };

          // Unlock next lesson
          const updatedUnlocked = [...prev.unlockedLessons];
          const currentLesson = LESSONS_BY_ID[lessonId];
          if (currentLesson && newStars >= 1) {
            const currentIdx = ORDERED_LESSONS.findIndex((l) => l.id === lessonId);
            const nextLesson = ORDERED_LESSONS[currentIdx + 1];
            if (nextLesson && !updatedUnlocked.includes(nextLesson.id)) {
              updatedUnlocked.push(nextLesson.id);
            }
          }

          const updated: Progress = {
            ...prev,
            totalXP: prev.totalXP + xpEarned,
            streak: newStreak,
            lastActivityDate: today,
            lessonProgress: updatedLessonProgress,
            unlockedLessons: updatedUnlocked,
          };

          return {
            progressByProfile: {
              ...s.progressByProfile,
              [profileId]: updated,
            },
          };
        });
      },
    }),
    {
      name: 'gjg-progress',
      version: 1,
    }
  )
);

export function getLevel(totalXP: number): number {
  return Math.floor(totalXP / 100);
}

export function getXPToNextLevel(totalXP: number): number {
  return 100 - (totalXP % 100);
}
