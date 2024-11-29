import { vi } from 'vitest';

vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
  prefetch: vi.fn(),
  prefetchRoutes: vi.fn(),
}));

vi.mock('$app/environment', () => ({
  browser: true,
  dev: false,
}));

vi.mock('__sveltekit/paths', () => ({
  assets: '',
  base: '',
}));

