// Composes the three domain list hooks and derives every analytic the UI needs.
// Keeps pages thin: a page calls this once and renders the result.

import { useMemo } from 'react';
import { useProjects, useResources, useAssignments } from '@/hooks/usePrototypeData';
import {
  coverageSummary,
  coverageByArea,
  coverageTrend,
  leadLeaderboard,
  resourceLeaderboard,
  riskBacklog,
  activityHeatmap,
  maxHeat,
} from '@/lib/analytics';
import type { Project, Resource, Assignment } from '@/types/domain-models';

export function useCoverageAnalytics() {
  const projectsQ = useProjects();
  const resourcesQ = useResources();
  const assignmentsQ = useAssignments();

  const projects: Project[] = useMemo(() => projectsQ.data ?? [], [projectsQ.data]);
  const resources: Resource[] = useMemo(() => resourcesQ.data ?? [], [resourcesQ.data]);
  const assignments: Assignment[] = useMemo(() => assignmentsQ.data ?? [], [assignmentsQ.data]);

  const analytics = useMemo(() => {
    const heatmap = activityHeatmap(projects);
    return {
      summary: coverageSummary(projects),
      byArea: coverageByArea(projects),
      trend: coverageTrend(projects),
      leads: leadLeaderboard(projects),
      topResources: resourceLeaderboard(resources),
      gaps: riskBacklog(projects),
      heatmap,
      heatMax: maxHeat(heatmap),
    };
  }, [projects, resources]);

  return {
    isLoading: projectsQ.isLoading || resourcesQ.isLoading || assignmentsQ.isLoading,
    isError: projectsQ.isError || resourcesQ.isError || assignmentsQ.isError,
    projects,
    resources,
    assignments,
    ...analytics,
  };
}
