import type { AppDataProvider } from '@/services/data-contracts';
import { getFieldMetadata } from '@/services/field-metadata-cache';
import type { Project } from '@/types/domain-models';
import type { Resource } from '@/types/domain-models';
import type { Assignment } from '@/types/domain-models';

// Replace the placeholder key mapping in this file after pac code add-data-source
// generates src/generated/** for your real connectors. Keep the UI-facing contract
// stable by adapting connector models into the domain models defined in src/types.

export function mapProjectFromConnector(record: Record<string, unknown>): Project {
  return {
    id: String(record.id ?? ''),
    name: String(record.name ?? ''),
    startDate: String(record.startDate ?? ''),
    client: record.client !== undefined ? String(record.client) : undefined,
    projectLead: record.projectLead !== undefined ? String(record.projectLead) : undefined,
    practiceArea: Number(record.practiceArea ?? 0),
    projectType: record.projectType !== undefined ? Number(record.projectType) : undefined,
    status: record.status !== undefined ? Number(record.status) : undefined,
    outcome: record.outcome !== undefined ? Number(record.outcome) : undefined,
    teamSize: record.teamSize !== undefined ? Number(record.teamSize) : undefined,
    riskReason: record.riskReason !== undefined ? Number(record.riskReason) : undefined,
    resourceCount: record.resourceCount !== undefined ? Number(record.resourceCount) : undefined,
  };
}

export function mapProjectToConnector(input: Partial<Project>): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
    ...(input.client !== undefined ? { client: input.client } : {}),
    ...(input.projectLead !== undefined ? { projectLead: input.projectLead } : {}),
    ...(input.practiceArea !== undefined ? { practiceArea: input.practiceArea } : {}),
    ...(input.projectType !== undefined ? { projectType: input.projectType } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.outcome !== undefined ? { outcome: input.outcome } : {}),
    ...(input.teamSize !== undefined ? { teamSize: input.teamSize } : {}),
    ...(input.riskReason !== undefined ? { riskReason: input.riskReason } : {}),
    ...(input.resourceCount !== undefined ? { resourceCount: input.resourceCount } : {}),
  };
}

// Example once your generated service exists:
// import { ProjectsService } from '@/generated/services/ProjectsService';
// const result = await ProjectsService.getAll();
// return (result.data || []).map((record) => mapProjectFromConnector(record as Record<string, unknown>));

export function mapResourceFromConnector(record: Record<string, unknown>): Resource {
  return {
    id: String(record.id ?? ''),
    name: String(record.name ?? ''),
    resourceType: Number(record.resourceType ?? 0),
    practiceArea: Number(record.practiceArea ?? 0),
    maturity: record.maturity !== undefined ? Number(record.maturity) : undefined,
    resourceUrl: record.resourceUrl !== undefined ? String(record.resourceUrl) : undefined,
    description: record.description !== undefined ? String(record.description) : undefined,
    owner: record.owner !== undefined ? String(record.owner) : undefined,
    usageCount: record.usageCount !== undefined ? Number(record.usageCount) : undefined,
    lastUsedOn: record.lastUsedOn !== undefined ? String(record.lastUsedOn) : undefined,
  };
}

export function mapResourceToConnector(input: Partial<Resource>): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.resourceType !== undefined ? { resourceType: input.resourceType } : {}),
    ...(input.practiceArea !== undefined ? { practiceArea: input.practiceArea } : {}),
    ...(input.maturity !== undefined ? { maturity: input.maturity } : {}),
    ...(input.resourceUrl !== undefined ? { resourceUrl: input.resourceUrl } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.usageCount !== undefined ? { usageCount: input.usageCount } : {}),
    ...(input.lastUsedOn !== undefined ? { lastUsedOn: input.lastUsedOn } : {}),
  };
}

// Example once your generated service exists:
// import { ResourcesService } from '@/generated/services/ResourcesService';
// const result = await ResourcesService.getAll();
// return (result.data || []).map((record) => mapResourceFromConnector(record as Record<string, unknown>));

export function mapAssignmentFromConnector(record: Record<string, unknown>): Assignment {
  return {
    id: String(record.id ?? ''),
    name: String(record.name ?? ''),
    project: String(record.project ?? ''),
    resource: String(record.resource ?? ''),
    assignmentNote: record.assignmentNote !== undefined ? String(record.assignmentNote) : undefined,
  };
}

export function mapAssignmentToConnector(input: Partial<Assignment>): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.project !== undefined ? { project: input.project } : {}),
    ...(input.resource !== undefined ? { resource: input.resource } : {}),
    ...(input.assignmentNote !== undefined ? { assignmentNote: input.assignmentNote } : {}),
  };
}

// Example once your generated service exists:
// import { AssignmentsService } from '@/generated/services/AssignmentsService';
// const result = await AssignmentsService.getAll();
// return (result.data || []).map((record) => mapAssignmentFromConnector(record as Record<string, unknown>));

export function createRealDataProvider(): AppDataProvider {
  return {
    projects: {
      async list() {
        throw new Error('Implement projects.list() in src/services/real-data-provider.ts using mapProjectFromConnector()');
      },
      async getById() {
        throw new Error('Implement projects.getById() in src/services/real-data-provider.ts using mapProjectFromConnector()');
      },
      async save() {
        throw new Error('Implement projects.save() in src/services/real-data-provider.ts using mapProjectToConnector()');
      },
    },
    resources: {
      async list() {
        throw new Error('Implement resources.list() in src/services/real-data-provider.ts using mapResourceFromConnector()');
      },
      async getById() {
        throw new Error('Implement resources.getById() in src/services/real-data-provider.ts using mapResourceFromConnector()');
      },
      async save() {
        throw new Error('Implement resources.save() in src/services/real-data-provider.ts using mapResourceToConnector()');
      },
    },
    assignments: {
      async list() {
        throw new Error('Implement assignments.list() in src/services/real-data-provider.ts using mapAssignmentFromConnector()');
      },
      async getById() {
        throw new Error('Implement assignments.getById() in src/services/real-data-provider.ts using mapAssignmentFromConnector()');
      },
      async save() {
        throw new Error('Implement assignments.save() in src/services/real-data-provider.ts using mapAssignmentToConnector()');
      },
    },
    fieldMetadata: { getField: getFieldMetadata },
  } satisfies AppDataProvider;
}
