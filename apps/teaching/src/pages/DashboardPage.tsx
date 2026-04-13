import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { LessonNode } from '../components/dashboard/LessonNode';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore, getLevel } from '../store/progressStore';
import { TOPICS, TOPICS_BY_ID, LESSONS, ORDERED_LESSONS } from '../data/topics';

export function DashboardPage() {
  const navigate = useNavigate();
  const activeProfile = useProfileStore((s) => s.getActiveProfile());
  const getProgress = useProgressStore((s) => s.getProgress);

  if (!activeProfile) return null;
  const progress = getProgress(activeProfile.id);
  const level = getLevel(progress.totalXP);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <TopBar />

      {/* Profile header */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-3">
        <span className="text-4xl">{activeProfile.avatarEmoji}</span>
        <div>
          <div className="font-bold text-base">{activeProfile.name}</div>
          <div className="text-xs text-gray-400">Level {level} · {progress.totalXP} XP</div>
        </div>
        <button
          onClick={() => {
            useProfileStore.getState().setActiveProfile(null);
            navigate('/');
          }}
          className="ml-auto text-xs text-gray-400 underline"
        >
          Switch
        </button>
      </div>

      {/* Lesson map — scrollable */}
      <div className="flex-1 overflow-y-auto pb-safe pb-8">
        {TOPICS.map((topic) => {
          const topicLessons = topic.lessonIds
            .map((id) => ORDERED_LESSONS.find((l) => l.id === id)!)
            .filter(Boolean)
            .sort((a, b) => a.order - b.order);

          return (
            <div key={topic.id} className="mb-8">
              {/* Topic header */}
              <div className={`${topic.color} mx-6 mt-6 mb-2 px-4 py-3 rounded-2xl flex items-center gap-2`}>
                <span className="text-2xl">{topic.emoji}</span>
                <span className="font-bold text-white text-sm">{topic.name}</span>
              </div>

              {/* Lesson nodes */}
              <div className="flex flex-col items-center gap-2 py-4">
                {topicLessons.map((lesson, idx) => {
                  const lp = progress.lessonProgress[lesson.id];
                  const stars = (lp?.stars ?? 0) as 0 | 1 | 2 | 3;
                  const unlocked = progress.unlockedLessons.includes(lesson.id);
                  return (
                    <LessonNode
                      key={lesson.id}
                      lesson={lesson}
                      topic={topic}
                      stars={stars}
                      unlocked={unlocked}
                      isFirst={idx === 0}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
