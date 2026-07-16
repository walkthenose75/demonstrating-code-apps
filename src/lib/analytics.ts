// Pure analytics over the project-portfolio domain. No React, no Fluent — fully
// testable. Coverage is project-centric (a project is "covered"/resourced when it
// has >=1 linked resource); Usage is resource-centric (how many projects a single
// resource backed). "Coverage" is retained as a portfolio term for resourced work.

import type { Resource, Assignment, Project } from '@/types/domain-models';
import { practiceAreaSet, riskReasonSet, labelOf, colorOf } from '@/lib/optionSets';
import { teamMember, leadName } from '@/mockData/reference';
import { daysSince, isoDate, pct } from '@/lib/format';

export function isCovered(p: Project): boolean {
  return (p.resourceCount ?? 0) > 0;
}

export interface CoverageSummary {
  total: number;
  covered: number;
  storyOnly: number;
  coveragePct: number;
}

export function coverageSummary(projects: Project[]): CoverageSummary {
  const total = projects.length;
  const covered = projects.filter(isCovered).length;
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

export function coverageByArea(projects: Project[]): AreaCoverage[] {
  return practiceAreaSet.options
    .map((opt) => {
      const inArea = projects.filter((p) => p.practiceArea === opt.value);
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

export function coverageTrend(projects: Project[]): MonthlyCoverage[] {
  const buckets = new Map<string, { total: number; covered: number }>();
  for (const p of projects) {
    const month = p.startDate.slice(0, 7);
    const b = buckets.get(month) ?? { total: 0, covered: 0 };
    b.total += 1;
    if (isCovered(p)) b.covered += 1;
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

export interface LeadStat {
  leadId: string;
  name: string;
  initials: string;
  projects: number;
  covered: number;
  coveragePct: number;
}

export function leadLeaderboard(projects: Project[]): LeadStat[] {
  const byId = new Map<string, { projects: number; covered: number }>();
  for (const p of projects) {
    const id = p.projectLead ?? 'unassigned';
    const s = byId.get(id) ?? { projects: 0, covered: 0 };
    s.projects += 1;
    if (isCovered(p)) s.covered += 1;
    byId.set(id, s);
  }
  return [...byId.entries()]
    .map(([leadId, s]) => ({
      leadId,
      name: leadName(leadId),
      initials: teamMember(leadId)?.initials ?? '—',
      projects: s.projects,
      covered: s.covered,
      coveragePct: pct(s.covered, s.projects),
    }))
    .sort((a, b) => b.projects - a.projects || b.coveragePct - a.coveragePct);
}

export interface ResourceStat extends Resource {
  reuse: number;
  staleDays?: number;
  isStale: boolean;
}

const STALE_THRESHOLD_DAYS = 90;

export function resourceLeaderboard(resources: Resource[]): ResourceStat[] {
  return resources
    .map((r) => {
      const staleDays = daysSince(r.lastUsedOn);
      return {
        ...r,
        reuse: r.usageCount ?? 0,
        staleDays,
        isStale: (r.usageCount ?? 0) === 0 || (staleDays !== undefined && staleDays > STALE_THRESHOLD_DAYS),
      };
    })
    .sort((a, b) => b.reuse - a.reuse || a.name.localeCompare(b.name));
}

export interface GapBucket {
  reason: number;
  label: string;
  color: string;
  projects: Project[];
}

export function riskBacklog(projects: Project[]): GapBucket[] {
  const storyOnly = projects.filter((p) => !isCovered(p));
  return riskReasonSet.options
    .map((opt) => ({
      reason: opt.value,
      label: opt.label,
      color: opt.color,
      projects: storyOnly
        .filter((p) => p.riskReason === opt.value)
        .sort((a, b) => (a.startDate < b.startDate ? 1 : -1)),
    }))
    .filter((b) => b.projects.length > 0)
    .sort((a, b) => b.projects.length - a.projects.length);
}

export interface HeatCell {
  date: string;
  count: number;
}

/** Weeks (columns) x 7 days (rows, Sun..Sat) ending today, for a GitHub-style heatmap. */
export function activityHeatmap(projects: Project[], weeks = 26): HeatCell[][] {
  const counts = new Map<string, number>();
  for (const p of projects) counts.set(p.startDate, (counts.get(p.startDate) ?? 0) + 1);

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
export interface ProjectFilter {
  search?: string;
  area?: number | null;
  type?: number | null;
  leadId?: string | null;
  coverage?: 'all' | 'covered' | 'story';
}

export function filterProjects(projects: Project[], filter: ProjectFilter): Project[] {
  const search = filter.search?.trim().toLowerCase();
  return projects.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search)) return false;
    if (filter.area != null && p.practiceArea !== filter.area) return false;
    if (filter.type != null && p.projectType !== filter.type) return false;
    if (filter.leadId && p.projectLead !== filter.leadId) return false;
    if (filter.coverage === 'covered' && !isCovered(p)) return false;
    if (filter.coverage === 'story' && isCovered(p)) return false;
    return true;
  });
}

/** Projects that used a given resource, via the assignment graph. */
export function projectsForResource(
  resourceId: string,
  assignments: Assignment[],
  projects: Project[],
): Project[] {
  const ids = new Set(assignments.filter((u) => u.resource === resourceId).map((u) => u.project));
  return projects.filter((p) => ids.has(p.id)).sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
}

/** Resources linked to a given project, via the assignment graph. */
export function resourcesForProject(
  projectId: string,
  assignments: Assignment[],
  resources: Resource[],
): Resource[] {
  const ids = new Set(assignments.filter((u) => u.project === projectId).map((u) => u.resource));
  return resources.filter((r) => ids.has(r.id));
}

export { labelOf, colorOf };
