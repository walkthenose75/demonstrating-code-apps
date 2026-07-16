// Composes the three domain list hooks and derives every analytic the UI needs.
// Keeps pages thin: a page calls this once and renders the result.

import { useMemo } from 'react';
import { useDemoDeliveries, useDemoAssets, useDemoAssetUsages } from '@/hooks/usePrototypeData';
import {
  coverageSummary,
  coverageByArea,
  coverageTrend,
  sellerLeaderboard,
  assetLeaderboard,
  gapBacklog,
  activityHeatmap,
  maxHeat,
} from '@/lib/analytics';
import type { DemoDelivery, DemoAsset, DemoAssetUsage } from '@/types/domain-models';

export function useCoverageAnalytics() {
  const deliveriesQ = useDemoDeliveries();
  const assetsQ = useDemoAssets();
  const usagesQ = useDemoAssetUsages();

  const deliveries: DemoDelivery[] = useMemo(() => deliveriesQ.data ?? [], [deliveriesQ.data]);
  const assets: DemoAsset[] = useMemo(() => assetsQ.data ?? [], [assetsQ.data]);
  const usages: DemoAssetUsage[] = useMemo(() => usagesQ.data ?? [], [usagesQ.data]);

  const analytics = useMemo(() => {
    const heatmap = activityHeatmap(deliveries);
    return {
      summary: coverageSummary(deliveries),
      byArea: coverageByArea(deliveries),
      trend: coverageTrend(deliveries),
      sellers: sellerLeaderboard(deliveries),
      topAssets: assetLeaderboard(assets),
      gaps: gapBacklog(deliveries),
      heatmap,
      heatMax: maxHeat(heatmap),
    };
  }, [deliveries, assets]);

  return {
    isLoading: deliveriesQ.isLoading || assetsQ.isLoading || usagesQ.isLoading,
    isError: deliveriesQ.isError || assetsQ.isError || usagesQ.isError,
    deliveries,
    assets,
    usages,
    ...analytics,
  };
}
