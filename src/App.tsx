import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/shell/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { DeliveriesPage } from '@/pages/DeliveriesPage';
import { AssetsPage } from '@/pages/AssetsPage';
import { AssetDetailPage } from '@/pages/AssetDetailPage';
import { GapsPage } from '@/pages/GapsPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { BuildCostPage } from '@/pages/BuildCostPage';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/deliveries" element={<DeliveriesPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />
        <Route path="/gaps" element={<GapsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/build-cost" element={<BuildCostPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
