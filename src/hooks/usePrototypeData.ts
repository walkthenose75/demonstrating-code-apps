import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppDataProvider } from '@/services/providerFactory';
import type { Project } from '@/types/domain-models';
import type { Resource } from '@/types/domain-models';
import type { Assignment } from '@/types/domain-models';

const provider = createAppDataProvider();

export const prototypeQueryKeys = {
  projects: ['projects'] as const,
  projectById: (id: string) => ['projects', id] as const,
  resources: ['resources'] as const,
  resourceById: (id: string) => ['resources', id] as const,
  assignments: ['assignments'] as const,
  assignmentById: (id: string) => ['assignments', id] as const,
};

// ── Generic optimistic save hook ──
// Dataverse read replicas lag behind writes by up to several seconds.
// A naive invalidate-and-refetch pattern after a mutation will show stale data.
// This hook merges the user's input over the cache entry on success.

function useOptimisticSave<T extends { id: string }>({
  listKey, itemKey, saveFn,
}: {
  listKey: readonly string[];
  itemKey: (id: string) => readonly string[];
  saveFn: (input: Partial<T>) => Promise<T>;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveFn,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      if (input.id) await queryClient.cancelQueries({ queryKey: itemKey(input.id) });
    },
    onSuccess: (serverRecord, input) => {
      const merged = input.id
        ? { ...(queryClient.getQueryData<T>(itemKey(input.id)) ?? serverRecord), ...input } as T
        : serverRecord;
      queryClient.setQueryData(itemKey(merged.id), merged);
      queryClient.setQueryData<T[]>(listKey, (old) => {
        if (!old) return [merged];
        const idx = old.findIndex((item) => item.id === merged.id);
        return idx >= 0
          ? old.map((item) => (item.id === merged.id ? merged : item))
          : [merged, ...old];
      });
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: prototypeQueryKeys.projects,
    queryFn: () => provider.projects.list(),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: prototypeQueryKeys.projectById(id || 'new'),
    queryFn: () => (id ? provider.projects.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useSaveProject() {
  return useOptimisticSave<Project>({
    listKey: prototypeQueryKeys.projects,
    itemKey: prototypeQueryKeys.projectById,
    saveFn: (input) => provider.projects.save(input),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => provider.projects.remove(id),
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Project[]>(prototypeQueryKeys.projects, (old) =>
        old ? old.filter((project) => project.id !== id) : old,
      );
      queryClient.removeQueries({ queryKey: prototypeQueryKeys.projectById(id) });
    },
  });
}

export function useResources() {
  return useQuery({
    queryKey: prototypeQueryKeys.resources,
    queryFn: () => provider.resources.list(),
  });
}

export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: prototypeQueryKeys.resourceById(id || 'new'),
    queryFn: () => (id ? provider.resources.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useSaveResource() {
  return useOptimisticSave<Resource>({
    listKey: prototypeQueryKeys.resources,
    itemKey: prototypeQueryKeys.resourceById,
    saveFn: (input) => provider.resources.save(input),
  });
}

export function useAssignments() {
  return useQuery({
    queryKey: prototypeQueryKeys.assignments,
    queryFn: () => provider.assignments.list(),
  });
}

export function useAssignment(id: string | undefined) {
  return useQuery({
    queryKey: prototypeQueryKeys.assignmentById(id || 'new'),
    queryFn: () => (id ? provider.assignments.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useSaveAssignment() {
  return useOptimisticSave<Assignment>({
    listKey: prototypeQueryKeys.assignments,
    itemKey: prototypeQueryKeys.assignmentById,
    saveFn: (input) => provider.assignments.save(input),
  });
}
