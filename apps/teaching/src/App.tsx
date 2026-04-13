import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ProfileSelectPage } from './pages/ProfileSelectPage';
import { DashboardPage } from './pages/DashboardPage';
import { LessonPage } from './pages/LessonPage';
import { ResultsPage } from './pages/ResultsPage';
import { ParentPortalPage } from './pages/ParentPortalPage';
import { useProfileStore } from './store/profileStore';
import { loadAudioManifest } from './hooks/useAudio';

function RequiresProfile({ children }: { children: React.ReactNode }) {
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const location = useLocation();

  if (!activeProfileId) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ProfileSelectPage />} />
        <Route
          path="/dashboard"
          element={
            <RequiresProfile>
              <DashboardPage />
            </RequiresProfile>
          }
        />
        <Route
          path="/lesson/:lessonId"
          element={
            <RequiresProfile>
              <LessonPage />
            </RequiresProfile>
          }
        />
        <Route
          path="/results"
          element={
            <RequiresProfile>
              <ResultsPage />
            </RequiresProfile>
          }
        />
        <Route path="/parent" element={<ParentPortalPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  useEffect(() => {
    loadAudioManifest().catch(console.error);
  }, []);

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
