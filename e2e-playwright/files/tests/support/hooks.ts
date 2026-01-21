import * as fs from 'fs';
import * as path from 'path';

import { After, AfterAll, Before, BeforeAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { BrowserContext, chromium } from '@playwright/test';


import { CustomWorld } from './world';

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

Before(async function (this: CustomWorld) {
  // Stuff to do before each test
  this.context = context;
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, scenario) {
  // Stuff to do after each test
  // By default we take a screenshat always after each test execution for the Validation Managers
  if (true /*scenario.result?.status === Status.FAILED*/) {
    const scenarioDirName = `${scenario.pickle.name.replace(/ /g, '_')}.png`;
    const scenarioDirPath = path.join(SCREENSHOT_DIR, scenarioDirName);
    fs.mkdirSync(scenarioDirPath, { recursive: true });
    const screenshotPath = path.join(scenarioDirPath, `${scenario.pickle.name.replace(/ /g, '_')}_${scenario.result?.status}.png`);
    await this.page.screenshot({ path: screenshotPath, type: 'png' });

    try {
      const screenshot = fs.readFileSync(screenshotPath);
      await this.attach(screenshot, 'image/png');
      this.lastScreenshot = screenshot;
    } catch (error) {
      console.error('Failed to read screenshot:', error);
    }
  }

  await this.page?.close();
});