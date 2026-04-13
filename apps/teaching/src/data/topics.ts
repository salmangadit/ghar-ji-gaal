import type { Topic, Lesson } from '../types/vocabulary';

export const TOPICS: Topic[] = [
  {
    id: 'greetings',
    name: 'Greetings',
    emoji: '👋',
    color: 'bg-amber-400',
    lessonIds: ['greetings-1', 'greetings-2'],
  },
  {
    id: 'family',
    name: 'Family',
    emoji: '👨‍👩‍👧‍👦',
    color: 'bg-rose-400',
    lessonIds: ['family-1', 'family-2'],
  },
  {
    id: 'numbers-colours',
    name: 'Numbers & Colours',
    emoji: '🔢',
    color: 'bg-violet-400',
    lessonIds: ['numbers-1', 'numbers-2', 'colours-1'],
  },
  {
    id: 'food-home',
    name: 'Food & Home',
    emoji: '🍽️',
    color: 'bg-emerald-400',
    lessonIds: ['food-1', 'food-2'],
  },
];

export const TOPICS_BY_ID: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t])
);

export const LESSONS: Lesson[] = [
  // ── Greetings ─────────────────────────────────────────────────────
  {
    id: 'greetings-1',
    topicId: 'greetings',
    title: 'Say Hello',
    wordIds: ['greet_hello', 'greet_reply', 'greet_thanks'],
    order: 1,
  },
  {
    id: 'greetings-2',
    topicId: 'greetings',
    title: 'Yes & No',
    wordIds: ['greet_yes', 'greet_no', 'greet_thanks'],
    order: 2,
  },

  // ── Family ────────────────────────────────────────────────────────
  {
    id: 'family-1',
    topicId: 'family',
    title: 'Mum & Dad',
    wordIds: ['fam_mother', 'fam_father', 'fam_brother', 'fam_sister'],
    order: 1,
  },
  {
    id: 'family-2',
    topicId: 'family',
    title: 'Grandparents',
    wordIds: ['fam_nani', 'fam_nana', 'fam_dadi', 'fam_dadu'],
    order: 2,
  },

  // ── Numbers & Colours ─────────────────────────────────────────────
  {
    id: 'numbers-1',
    topicId: 'numbers-colours',
    title: 'Numbers 1–5',
    wordIds: ['num_1', 'num_2', 'num_3', 'num_4', 'num_5'],
    order: 1,
  },
  {
    id: 'numbers-2',
    topicId: 'numbers-colours',
    title: 'Numbers 6–10',
    wordIds: ['num_6', 'num_7', 'num_8', 'num_9', 'num_10'],
    order: 2,
  },
  {
    id: 'colours-1',
    topicId: 'numbers-colours',
    title: 'Colours',
    wordIds: ['col_red', 'col_blue', 'col_green', 'col_yellow'],
    order: 3,
  },

  // ── Food & Home ───────────────────────────────────────────────────
  {
    id: 'food-1',
    topicId: 'food-home',
    title: 'Around the Table',
    wordIds: ['food_water', 'food_rice', 'food_bread', 'food_milk', 'food_eat'],
    order: 1,
  },
  {
    id: 'food-2',
    topicId: 'food-home',
    title: 'Around the House',
    wordIds: ['food_house', 'food_door', 'food_water'],
    order: 2,
  },
];

export const LESSONS_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l])
);

/** All lessons in display order (topic order → within-topic order) */
export const ORDERED_LESSONS: Lesson[] = TOPICS.flatMap((topic) =>
  topic.lessonIds.map((id) => LESSONS_BY_ID[id]!).sort((a, b) => a.order - b.order)
);
