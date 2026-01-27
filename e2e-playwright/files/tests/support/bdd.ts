import { createBdd, test } from 'playwright-bdd';

// Expose Cucumber-style bindings backed by Playwright Test fixtures.
export const {
  Before,
  BeforeAll,
  After,
  AfterAll,
  Given,
  When,
  Then,
  And,
} = createBdd(test);
