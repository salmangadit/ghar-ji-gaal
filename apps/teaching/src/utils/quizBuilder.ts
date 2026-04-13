import { nanoid } from 'nanoid';
import type { VocabWord, AgeTrack } from '../types/vocabulary';
import type { QuizQuestion, QuizMode } from '../types/quiz';
import { VERIFIED_WORDS } from '../data/vocabulary';

/** Fisher-Yates shuffle (in-place, returns the array) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Pick N distractors from pool, excluding the correct word. */
function pickDistractors(correct: VocabWord, pool: VocabWord[], count: number): VocabWord[] {
  const filtered = pool.filter((w) => w.id !== correct.id);
  return shuffle(filtered).slice(0, count);
}

function modeForTrack(track: AgeTrack): QuizMode {
  const map: Record<AgeTrack, QuizMode> = {
    'tiny-tots': 'tap-picture',
    'young-learner': 'multiple-choice',
    'explorer': 'fill-blank',
    'teen': 'type-answer',
  };
  return map[track];
}

export function buildQuizQuestions(
  lessonWords: VocabWord[],
  ageTrack: AgeTrack
): QuizQuestion[] {
  const mode = modeForTrack(ageTrack);
  const sameTopicPool = VERIFIED_WORDS.filter((w) => w.topicId === lessonWords[0]?.topicId);
  const fullPool = VERIFIED_WORDS;

  return shuffle([...lessonWords]).map((word): QuizQuestion => {
    // Tiny-tots: always show Memoni → pick emoji/picture
    // Young-learner: alternate direction per word
    // Explorer/Teen: mix of directions
    const direction: QuizQuestion['direction'] =
      mode === 'tap-picture'
        ? 'memoni-to-english'
        : Math.random() > 0.5
        ? 'memoni-to-english'
        : 'english-to-memoni';

    const prompt =
      direction === 'memoni-to-english'
        ? `${word.memoni} ${word.emoji}`
        : word.english;

    const correctAnswer =
      direction === 'memoni-to-english' ? word.english : word.memoni;

    // Distractors
    const distractorPool = mode === 'tap-picture' ? sameTopicPool : fullPool;
    const distractorCount = mode === 'tap-picture' ? 3 : mode === 'fill-blank' ? 4 : 3;
    const distractors = pickDistractors(word, distractorPool, distractorCount);

    const distractorAnswers = distractors.map((d) =>
      direction === 'memoni-to-english' ? d.english : d.memoni
    );

    // Place correct answer at a random position (never always first)
    const options = shuffle([correctAnswer, ...distractorAnswers]);

    return {
      id: nanoid(),
      wordId: word.id,
      mode,
      prompt,
      correctAnswer,
      options,
      direction,
    };
  });
}
