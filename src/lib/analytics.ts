// Pure analytics over the demo-asset domain. No React, no Fluent — fully testable.
// Coverage is delivery-centric (a delivery is "covered" when it has >=1 linked
// asset); Reuse is asset-centric (how many deliveries a single asset backed).

import type { DemoAsset, DemoAssetUsage, DemoDelivery } from '@/types/domain-models';
import { solutionAreaSet, assetGapReasonSet, labelOf, colorOf } from '@/lib/optionSets';
import { seller, sellerName } from '@/mockData/reference';
import { daysSince, isoDate, pct } from '@/lib/format';

export function isCovered(d: DemoDelivery): boolean {
  return (d.linkedAssetCount ?? 0) > 0;
}

export interface CoverageSummary {
  total: number;
  covered: number;
  storyOnly: number;
  coveragePct: number;
}

export function coverageSummary(deliveries: DemoDelivery[]): CoverageSummary {
  const total = deliveries.length;
  const covered = deliveries.filter(isCovered).length;
  return { total, covered, storyOnly: total - covered, coveragePct: pct(covered, total) };
}

export interface AreaCoverage {
  area: number;
  label: string;
  color: string;
  total: number;
  covered: number;
  coveragePct: number;
}

export function coverageByArea(deliveries: DemoDelivery[]): AreaCoverage[] {
  return solutionAreaSet.options
    .map((opt) => {
      const inArea = deliveries.filter((d) => d.solutionArea === opt.value);
      const covered = inArea.filter(isCovered).length;
      return {
        area: opt.value,
        label: opt.label,
        color: opt.color,
        total: inArea.length,
        covered,
        coveragePct: pct(covered, inArea.length),
      };
    })
    .filter((a) => a.total > 0)
    .sort((a, b) => b.total - a.total);
}

export interface MonthlyCoverage {
  month: string; // yyyy-mm
  label: string;
  total: number;
  covered: number;
  coveragePct: number;
}

export function coverageTrend(deliveries: DemoDelivery[]): MonthlyCoverage[] {
  const buckets = new Map<string, { total: number; covered: number }>();
  for (const d of deliveries) {
    const month = d.deliveryDate.slice(0, 7);
    const b = buckets.get(month) ?? { total: 0, covered: 0 };
    b.total += 1;
    if (isCovered(d)) b.covered += 1;
    buckets.set(month, b);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, b]) => ({
      month,
      label: new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, { month: 'short' }),
      total: b.total,
      covered: b.covered,
      coveragePct: pct(b.covered, b.total),
    }));
}

export interface SellerStat {
  sellerId: string;
  name: string;
  initials: string;
  deliveries: number;
  covered: number;
  coveragePct: number;
}

export function sellerLeaderboard(deliveries: DemoDelivery[]): SellerStat[] {
  const byId = new Map<string, { deliveries: number; covered: number }>();
  for (const d of deliveries) {
    const id = d.presenter ?? 'unassigned';
    const s = byId.get(id) ?? { deliveries: 0, covered: 0 };
    s.deliveries += 1;
    if (isCovered(d)) s.covered += 1;
    byId.set(id, s);
  }
  return [...byId.entries()]
    .map(([sellerId, s]) => ({
      sellerId,
      name: sellerName(sellerId),
      initials: seller(sellerId)?.initials ?? '—',
      deliveries: s.deliveries,
      covered: s.covered,
      coveragePct: pct(s.covered, s.deliveries),
    }))
    .sort((a, b) => b.deliveries - a.deliveries || b.coveragePct - a.coveragePct);
}

export interface AssetStat extends DemoAsset {
  reuse: number;
  staleDays?: number;
  isStale: boolean;
}

const STALE_THRESHOLD_DAYS = 90;

export function assetLeaderboard(assets: DemoAsset[]): AssetStat[] {
  return assets
    .map((a) => {
      const staleDays = daysSince(a.lastUsedOn);
      return {
        ...a,
        reuse: a.reuseCount ?? 0,
        staleDays,
        isStale: (a.reuseCount ?? 0) === 0 || (staleDays !== undefined && staleDays > STALE_THRESHOLD_DAYS),
      };
    })
    .sort((a, b) => b.reuse - a.reuse || a.name.localeCompare(b.name));
}

export interface GapBucket {
  reason: number;
  label: string;
  color: string;
  deliveries: DemoDelivery[];
}

export function gapBacklog(deliveries: DemoDelivery[]): GapBucket[] {
  const storyOnly = deliveries.filter((d) => !isCovered(d));
  return assetGapReasonSet.options
    .map((opt) => ({
      reason: opt.value,
      label: opt.label,
      color: opt.color,
      deliveries: storyOnly
        .filter((d) => d.assetGapReason === opt.value)
        .sort((a, b) => (a.deliveryDate < b.deliveryDate ? 1 : -1)),
    }))
    .filter((b) => b.deliveries.length > 0)
    .sort((a, b) => b.deliveries.length - a.deliveries.length);
}

export interface HeatCell {
  date: string;
  count: number;
}

/** Weeks (columns) x 7 days (rows, Sun..Sat) ending today, for a GitHub-style heatmap. */
export function activityHeatmap(deliveries: DemoDelivery[], weeks = 26): HeatCell[][] {
  const counts = new Map<string, number>();
  for (const d of deliveries) counts.set(d.deliveryDate, (counts.get(d.deliveryDate) ?? 0) + 1);

  const today = new Date();
  const end = new Date(today);
  // Advance to the end of the current week (Saturday).
  end.setDate(end.getDate() + (6 - end.getDay()));

  const grid: HeatCell[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const col: HeatCell[] = [];
    for (let day = 0; day < 7; day++) {
      const cellDate = new Date(end);
      cellDate.setDate(end.getDate() - w * 7 + (day - 6));
      const iso = isoDate(cellDate);
      col.push({ date: iso, count: cellDate > today ? 0 : counts.get(iso) ?? 0 });
    }
    grid.push(col);
  }
  return grid;
}

export function maxHeat(grid: HeatCell[][]): number {
  let max = 0;
  for (const col of grid) for (const cell of col) if (cell.count > max) max = cell.count;
  return max;
}

// ── Faceted filtering ───────────────────────────────────────────────────────
export interface DeliveryFilter {
  search?: string;
  area?: number | null;
  format?: number | null;
  sellerId?: string | null;
  coverage?: 'all' | 'covered' | 'story';
}

export function filterDeliveries(deliveries: DemoDelivery[], filter: DeliveryFilter): DemoDelivery[] {
  const search = filter.search?.trim().toLowerCase();
  return deliveries.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search)) return false;
    if (filter.area != null && d.solutionArea !== filter.area) return false;
    if (filter.format != null && d.deliveryFormat !== filter.format) return false;
    if (filter.sellerId && d.presenter !== filter.sellerId) return false;
    if (filter.coverage === 'covered' && !isCovered(d)) return false;
    if (filter.coverage === 'story' && isCovered(d)) return false;
    return true;
  });
}

/** Deliveries that reused a given asset, via the usage graph. */
export function deliveriesForAsset(
  assetId: string,
  usages: DemoAssetUsage[],
  deliveries: DemoDelivery[],
): DemoDelivery[] {
  const ids = new Set(usages.filter((u) => u.demoAsset === assetId).map((u) => u.demoDelivery));
  return deliveries.filter((d) => ids.has(d.id)).sort((a, b) => (a.deliveryDate < b.deliveryDate ? 1 : -1));
}

/** Assets linked to a given delivery, via the usage graph. */
export function assetsForDelivery(
  deliveryId: string,
  usages: DemoAssetUsage[],
  assets: DemoAsset[],
): DemoAsset[] {
  const ids = new Set(usages.filter((u) => u.demoDelivery === deliveryId).map((u) => u.demoAsset));
  return assets.filter((a) => ids.has(a.id));
}

export { labelOf, colorOf };
