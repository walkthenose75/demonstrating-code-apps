// Rich prototype data lives in demoDataset.ts (curated + generated + rollups).
// This file preserves the export name the mock provider imports.
import { demoDeliveries } from '@/mockData/demoDataset';
import type { DemoDelivery } from '@/types/domain-models';

export const mockDemoDeliverys: DemoDelivery[] = demoDeliveries;
