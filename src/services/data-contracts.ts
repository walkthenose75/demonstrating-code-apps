// Provider contracts are the seam between mock UX and real connectors.

import type { Project } from '@/types/domain-models';
import type { Resource } from '@/types/domain-models';
import type { Assignment } from '@/types/domain-models';

export type DataverseFieldRequiredLevel = 'none' | 'recommended' | 'application' | 'system';

export interface DataverseFieldMetadata {
  tableLogicalName: string;
  fieldLogicalName: string;
  displayName?: string;
  requiredLevel: DataverseFieldRequiredLevel;
  isRequired: boolean;
  maxLength?: number;   // String/Memo columns
  minValue?: number;    // Money/Decimal/Integer columns
  maxValue?: number;    // Money/Decimal/Integer columns
  precision?: number;   // Money/Decimal columns
}

export interface FieldMetadataRepository {
  getField(tableLogicalName: string, fieldLogicalName: string): Promise<DataverseFieldMetadata | null>;
}

export interface ProjectRepository {
  list(): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  save(input: Partial<Project>): Promise<Project>;
  remove(id: string): Promise<void>;
}

export interface ResourceRepository {
  list(): Promise<Resource[]>;
  getById(id: string): Promise<Resource | null>;
  save(input: Partial<Resource>): Promise<Resource>;
}

export interface AssignmentRepository {
  list(): Promise<Assignment[]>;
  getById(id: string): Promise<Assignment | null>;
  save(input: Partial<Assignment>): Promise<Assignment>;
}

export interface AppDataProvider {
  projects: ProjectRepository;
  resources: ResourceRepository;
  assignments: AssignmentRepository;
  fieldMetadata: FieldMetadataRepository;
}
