import { useMemo } from 'react';
import { useProjects, useProject } from '@/hooks/usePrototypeData';
import type { Project } from '@/types/domain-models';
import {
  generateTasks, generateMilestones, projectHealth, projectFinancials,
  generateRaid, generateApprovals, generateComments, generateAttachments,
  generateActivity, portfolioFinancials, raidLog, approvalsQueue, activityFeed,
  capacityByPerson,
} from '@/lib/enterprise/generate';

/** Execution detail for a single project — tasks, milestones, health, collab. */
export function useProjectExecution(id: string | undefined) {
  const projectQuery = useProject(id);
  const project = projectQuery.data ?? undefined;
  const bundle = useMemo(() => {
    if (!project) return null;
    const tasks = generateTasks(project);
    return {
      project,
      tasks,
      milestones: generateMilestones(project),
      health: projectHealth(project, tasks),
      financials: projectFinancials(project, tasks),
      raid: generateRaid(project),
      approvals: generateApprovals(project),
      comments: generateComments(project),
      attachments: generateAttachments(project),
      activity: generateActivity(project),
    };
  }, [project]);
  return { ...projectQuery, bundle };
}

/** Portfolio financials rollup. */
export function usePortfolioFinancials() {
  const query = useProjects();
  const rows = useMemo(
    () => (query.data ? portfolioFinancials(query.data) : []),
    [query.data],
  );
  return { ...query, rows };
}

/** People capacity / utilization across all leads. */
export function useCapacity() {
  const query = useProjects();
  const rows = useMemo(
    () => (query.data ? capacityByPerson(query.data) : []),
    [query.data],
  );
  return { ...query, rows };
}

/** Portfolio RAID log + approval queue. */
export function useRaid() {
  const query = useProjects();
  const raid = useMemo(() => (query.data ? raidLog(query.data) : []), [query.data]);
  const approvals = useMemo(
    () => (query.data ? approvalsQueue(query.data) : []),
    [query.data],
  );
  return { ...query, raid, approvals };
}

/** Portfolio-wide activity feed. */
export function useActivityFeed() {
  const query = useProjects();
  const events = useMemo(
    () => (query.data ? activityFeed(query.data) : []),
    [query.data],
  );
  return { ...query, events };
}

/** Health map keyed by project id, for annotating list views. */
export function useHealthByProject(projects: Project[] | undefined) {
  return useMemo(() => {
    const map = new Map<string, ReturnType<typeof projectHealth>>();
    for (const p of projects ?? []) map.set(p.id, projectHealth(p));
    return map;
  }, [projects]);
}
