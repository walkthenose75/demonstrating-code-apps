import type { AppDataProvider } from '@/services/data-contracts';
import type { Project } from '@/types/domain-models';
import type { Resource } from '@/types/domain-models';
import type { Assignment } from '@/types/domain-models';
import { mockProjects } from '@/mockData/project';
import { mockResources } from '@/mockData/resource';
import { mockAssignments } from '@/mockData/assignment';

type PrototypeRecord = {
  id: string;
  name?: string;
};

function cloneRecord<T>(record: T): T {
  return JSON.parse(JSON.stringify(record)) as T;
}

function createCollectionRepository<T extends PrototypeRecord>(records: T[], buildFallbackName: () => string) {
  return {
    async list(): Promise<T[]> {
      return records.map((record) => cloneRecord(record));
    },
    async getById(id: string): Promise<T | null> {
      const record = records.find((item) => item.id === id);
      return record ? cloneRecord(record) : null;
    },
    async save(input: Partial<T>): Promise<T> {
      if (input.id) {
        const index = records.findIndex((record) => record.id === input.id);
        if (index >= 0) {
          records[index] = { ...records[index], ...input };
          return cloneRecord(records[index]);
        }
      }

      const record = {
        id: input.id || crypto.randomUUID(),
        name: input.name || buildFallbackName(),
        ...input,
      } as T;
      records.unshift(record);
      return cloneRecord(record);
    },
  };
}

export function createMockDataProvider(): AppDataProvider {
  const store = {
    projects: mockProjects.map((record) => cloneRecord(record)),
    resources: mockResources.map((record) => cloneRecord(record)),
    assignments: mockAssignments.map((record) => cloneRecord(record)),
  };

  return {
    projects: createCollectionRepository<Project>(store.projects, () => 'Project Draft'),
    resources: createCollectionRepository<Resource>(store.resources, () => 'Resource Draft'),
    assignments: createCollectionRepository<Assignment>(store.assignments, () => 'Assignment Draft'),
    fieldMetadata: {
      async getField() { return null; },
    },
  } satisfies AppDataProvider;
}
