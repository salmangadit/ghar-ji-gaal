import { useState } from 'react';
import { TinyTotQuiz } from './TinyTotQuiz';
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz';
import { FillBlankQuiz } from './FillBlankQuiz';
import { TeenQuiz } from './TeenQuiz';
import { useQuiz } from '../../hooks/useQuiz';
import type { QuizQuestion } from '../../types/quiz';
import type { AgeTrack } from '../../types/vocabulary';

interface QuizOrchestratorProps {
  questions: QuizQuestion[];
  ageTrack: AgeTrack;
  lessonId: string;
  profileId: string;
  onComplete: (result: ReturnType<ReturnType<typeof useQuiz>['getResult']>) => void;
}

export function QuizOrchestrator({
  questions,
  ageTrack,
  lessonId,
  profileId,
  onComplete,
}: QuizOrchestratorProps) {
  const [lastSelected, setLastSelected] = useState<string | undefined>();
  const quiz = useQuiz(questions, ageTrack);

  function handleAnswer(answer: string) {
    setLastSelected(answer);
    quiz.submitAnswer(answer);
  }

  function handleNext() {
    setLastSelected(undefined);
    if (quiz.isFinished || quiz.questionIndex >= questions.length - 1) {
      onComplete(quiz.getResult(lessonId, profileId));
    } else {
      quiz.nextQuestion();
    }
  }

  // Progress bar
  const progressPct = Math.round((quiz.questionIndex / questions.length) * 100);

  if (!quiz.current) {
    // All done — trigger complete
    onComplete(quiz.getResult(lessonId, profileId));
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pb-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, backgroundColor: 'var(--color-secondary)' }}
          />
        </div>
        <p className="text-xs text-gray-400 text-right mt-1">
          {quiz.questionIndex + 1} / {questions.length}
        </p>
      </div>

      {/* Quiz component */}
      {ageTrack === 'tiny-tots' && (
        <TinyTotQuiz
          question={quiz.current}
          answerState={quiz.answerState}
          retriesLeft={quiz.retriesLeft}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      )}
      {ageTrack === 'young-learner' && (
        <MultipleChoiceQuiz
          question={quiz.current}
          answerState={quiz.answerState}
          selectedAnswer={lastSelected}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      )}
      {ageTrack === 'explorer' && (
        <FillBlankQuiz
          question={quiz.current}
          answerState={quiz.answerState}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      )}
      {ageTrack === 'teen' && (
        <TeenQuiz
          question={quiz.current}
          answerState={quiz.answerState}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
