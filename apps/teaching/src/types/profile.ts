import type { AgeTrack } from './vocabulary';

export interface Profile {
  id: string;                // nanoid()
  name: string;
  avatarEmoji: string;
  ageTrack: AgeTrack;
  createdAt: number;         // Date.now()
}

export interface LessonProgress {
  lessonId: string;
  stars: 0 | 1 | 2 | 3;
  completedAt: number;       // Date.now() of last completion
}

export interface Progress {
  profileId: string;
  totalXP: number;           // level = Math.floor(totalXP / 100)
  streak: number;
  lastActivityDate: string;  // ISO "YYYY-MM-DD" — not a timestamp
  lessonProgress: Record<string, LessonProgress>;
  unlockedLessons: string[];
}
