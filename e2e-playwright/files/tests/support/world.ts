import { setWorldConstructor, World, IWorldOptions, ITestCaseHookParameter } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import * as path from 'path';

export class CustomWorld extends World {
    public page!: Page;
    public browser!: Browser;
    public context!: BrowserContext;
    public lastScreenshot?: Buffer;
    public currentScenario: ITestCaseHookParameter | null = null;

    constructor(options: IWorldOptions) {
        super(options);
    }
}

// Helper function to take screenshots with proper typing for CustomWorld context
export async function takeScreenshot(this: CustomWorld, stepName: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedName = stepName.replace(/[^a-zA-Z0-9]/g, '_');
    const screenshotPath = path.join('test-results', 'screenshots', `${sanitizedName}_${timestamp}.png`);
    await this.page.screenshot({ path: screenshotPath });
}

setWorldConstructor(CustomWorld);
