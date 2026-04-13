import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@ghar-ji-gaal/shared';
import type { User } from '@supabase/supabase-js';
import { ContributePage } from './pages/ContributePage';
import { DemoContributePage } from './pages/DemoContributePage';
import { DemoLandingPage } from './pages/DemoLandingPage';
import { DemoResponsesPage } from './pages/DemoResponsesPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { NewRequestPage } from './pages/admin/NewRequestPage';
import { RequestsPage } from './pages/admin/RequestsPage';
import { ReviewPage } from './pages/admin/ReviewPage';
import { ExportPage } from './pages/admin/ExportPage';

const IS_DEMO = import.meta.env['VITE_DEMO_MODE'] === 'true';

function RequiresAdmin({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return <div className="flex items-center justify-center min-h-[100dvh] text-gray-400 text-sm">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  if (IS_DEMO) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/" element={<DemoLandingPage />} />
          <Route path="/contribute/:token" element={<DemoContributePage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/demo/responses" element={<DemoResponsesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public contributor routes */}
        <Route path="/contribute/:token" element={<ContributePage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<RequiresAdmin><AdminDashboard /></RequiresAdmin>} />
        <Route path="/admin/new" element={<RequiresAdmin><NewRequestPage /></RequiresAdmin>} />
        <Route path="/admin/requests" element={<RequiresAdmin><RequestsPage /></RequiresAdmin>} />
        <Route path="/admin/review/:requestId" element={<RequiresAdmin><ReviewPage /></RequiresAdmin>} />
        <Route path="/admin/export" element={<RequiresAdmin><ExportPage /></RequiresAdmin>} />

        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-4 text-center">
            <div className="text-4xl">🏠</div>
            <h1 className="text-xl font-bold">Ghar ji Ghaal Collector</h1>
            <p className="text-sm text-gray-500">This app collects Memoni vocabulary from community members.</p>
            <a href="#/admin" className="text-primary underline text-sm">Admin panel</a>
          </div>
        } />
      </Routes>
    </HashRouter>
  );
}
