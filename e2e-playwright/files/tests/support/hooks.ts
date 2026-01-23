import * as fs from 'fs';
import * as path from 'path';

import { After, AfterAll, Before, BeforeAll, AfterStep, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { BrowserContext, chromium } from '@playwright/test';


import { CustomWorld } from './world';
import { captureScreenshotWithMetadata } from './screenshot-utils';

process.env.BASE_URL = "https://es.wikipedia.org/wiki";
process.env.FORCE_COLOR = '0';

const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'test-results', 'screenshots');
let context: BrowserContext;
const tempProfilePath = path.join(__dirname, '..', '..', 'temp-profile');

BeforeAll({ timeout: 120000 }, async () => {
    //Stuff to do before all the test suite
  if (fs.existsSync(tempProfilePath)) {
    fs.rmSync(tempProfilePath, { recursive: true, force: true });
  }
  fs.mkdirSync(tempProfilePath, { recursive: true });

    const launchOptions =
    { // Options for CI environment (e.g., Jenkins)
      headless: true,
      ignoreHTTPSErrors: true,
      viewport: { width: 1920, height: 1080 },
    };
    /*
    { // Options for local development
      channel: 'msedge' as 'msedge',
      headless: false,
      ignoreHTTPSErrors: true,
      viewport: { width: 1920, height: 1080 },
      args: ['--start-maximized']
    };
    */
  context = await chromium.launchPersistentContext(tempProfilePath, launchOptions);
});

AfterAll(async () => {
  //Stuff to do after all the test suite
  await context?.close();
  // Add a small delay to allow the browser process to release file locks, especially on Windows.
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (fs.existsSync(tempProfilePath)) {
    fs.rmSync(tempProfilePath, { recursive: true, force: true });
  }
});

Before(async function (this: CustomWorld, scenario) {
  this.currentScenario = scenario;
  // Stuff to do before each test
  this.context = context;
  this.page = await this.context.newPage();
});

AfterStep(async function (this: CustomWorld, { pickleStep, result }) {
  this.currentStepName = pickleStep.text;
  if (this.currentScenario) {
    this.currentScenario.result = result;
    await captureScreenshotWithMetadata(this, this.currentScenario, SCREENSHOT_DIR);
  }
});

After(async function (this: CustomWorld, scenario) {
  // Stuff to do after each test
  // By default we take a screenshat always after each test execution for the Validation Managers
  await this.page?.close();
});