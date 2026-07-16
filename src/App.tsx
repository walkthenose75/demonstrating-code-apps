import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/shell/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { ResourceDetailPage } from '@/pages/ResourceDetailPage';
import { RisksPage } from '@/pages/RisksPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { FinancialsPage } from '@/pages/FinancialsPage';
import { CapacityPage } from '@/pages/CapacityPage';
import { RaidPage } from '@/pages/RaidPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { BuildCostPage } from '@/pages/BuildCostPage';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route path="/financials" element={<FinancialsPage />} />
        <Route path="/capacity" element={<CapacityPage />} />
        <Route path="/raid" element={<RaidPage />} />
        <Route path="/risks" element={<RisksPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/build-cost" element={<BuildCostPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
