import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const testDir = defineBddConfig({
  features: 'tests/acceptance/features/**/*.feature',
  steps: [
    'tests/acceptance/step_definitions/**/*.ts',
    'tests/support/**/*.ts',
  ],
  outputDir: 'tests/.features-gen',
});

// Automatically generate Playwright tests from .feature files when invoking
// `npx playwright test` directly. This keeps the .features-gen folder in sync
// without requiring a separate bddgen step.
if (
  !process.env.TEST_WORKER_INDEX &&
  !process.env.PLAYWRIGHT_BDD_AUTO_GEN &&
  !process.env.PLAYWRIGHT_BDD_GEN
) {
  const bddgenBin = path.join(
    __dirname,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'bddgen.cmd' : 'bddgen',
  );
  try {
    execFileSync(bddgenBin, ['test'], {
      stdio: 'inherit',
      env: { ...process.env, PLAYWRIGHT_BDD_AUTO_GEN: '1' },
    });
  } catch (error) {
    console.error('Failed to generate BDD test files before running Playwright.', error);
    process.exit(1);
  }
}

export default defineConfig({
  testDir,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/reports/html', open: 'never' }],
    ['junit', { outputFile: 'test-results/reports/junit-report.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://es.wikipedia.org/wiki',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  outputDir: 'test-results/artifacts',
});
