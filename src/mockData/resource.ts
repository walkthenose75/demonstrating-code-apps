// Rich prototype data lives in projectDataset.ts (curated + generated + rollups).
// This file preserves the export name the mock provider imports.
import { resources } from '@/mockData/projectDataset';
import type { Resource } from '@/types/domain-models';

export const mockResources: Resource[] = resources;
