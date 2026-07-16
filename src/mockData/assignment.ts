// Rich prototype data lives in projectDataset.ts (curated + generated + rollups).
// This file preserves the export name the mock provider imports.
import { assignments } from '@/mockData/projectDataset';
import type { Assignment } from '@/types/domain-models';

export const mockAssignments: Assignment[] = assignments;
