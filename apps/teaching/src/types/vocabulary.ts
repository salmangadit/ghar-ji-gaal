export type AgeTrack = 'tiny-tots' | 'young-learner' | 'explorer' | 'teen';

export type TopicId = 'greetings' | 'family' | 'numbers-colours' | 'food-home';

export interface VocabWord {
  id: string;
  topicId: TopicId;
  memoni: string;            // Roman phonetic spelling
  english: string;
  emoji: string;
  audioUrl: string | null;   // Supabase storage URL, null until recorded
  difficulty: 1 | 2 | 3;
  sentenceTemplate?: string; // e.g. "I drink ___ every morning" (fill-blank / teen)
  verified: boolean;         // only true words appear in lessons
}

export interface Topic {
  id: TopicId;
  name: string;
  emoji: string;
  color: string;             // Tailwind bg class, e.g. "bg-amber-400"
  lessonIds: string[];
}

export interface Lesson {
  id: string;
  topicId: TopicId;
  title: string;
  wordIds: string[];         // references to VocabWord.id
  order: number;             // 1-based within topic
}
