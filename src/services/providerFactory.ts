import type { AppDataProvider } from '@/services/data-contracts';
import { createMockDataProvider } from '@/services/mock-data-provider';
import { createRealDataProvider } from '@/services/real-data-provider';

// Prototype phase (00d golden path): default to the mock provider so the demo
// runs identically in `npm run dev:local`, `vite preview`, and tests. Connected
// mode is opt-in via VITE_USE_MOCK=false once Phase 6 (pac code add-data-source)
// has generated src/generated/** and real-data-provider.ts is implemented.
export function createAppDataProvider(): AppDataProvider {
  return import.meta.env.VITE_USE_MOCK === 'false'
    ? createRealDataProvider()
    : createMockDataProvider();
}
