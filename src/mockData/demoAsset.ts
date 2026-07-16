// Rich prototype data lives in demoDataset.ts (curated catalog + rollups).
// This file preserves the export name the mock provider imports.
import { demoAssets } from '@/mockData/demoDataset';
import type { DemoAsset } from '@/types/domain-models';

export const mockDemoAssets: DemoAsset[] = demoAssets;
