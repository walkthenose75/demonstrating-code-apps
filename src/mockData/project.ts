// Rich prototype data lives in projectDataset.ts (curated + generated + rollups).
// This file preserves the export name the mock provider imports.
import { projects } from '@/mockData/projectDataset';
import type { Project } from '@/types/domain-models';

export const mockProjects: Project[] = projects;
