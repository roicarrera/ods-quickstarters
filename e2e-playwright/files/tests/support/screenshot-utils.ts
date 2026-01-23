import * as fs from 'fs';
import * as path from 'path';
import { ITestCaseHookParameter } from '@cucumber/cucumber';
import { CustomWorld } from './world';

export async function captureScreenshotWithMetadata(
  world: CustomWorld,
  scenario: ITestCaseHookParameter,
  screenshotBaseDir: string
) {
  const metadata = {
    project: process.env.COMPONENT_ID || 'N/A',
    env: process.env.ENVIRONMENT || 'N/A',
    build: process.env.BUILD_NUMBER || 'N/A',
    date: new Date().toLocaleString('sv-SE', { timeZoneName: 'short' }),
    commit: process.env.COMMIT_INFO_SHA || 'N/A',
    scenario: scenario.pickle.name,
    error: scenario.result?.message?.split('\n')[0] || 'Unknown Error',
    step: world.currentStepName || 'N/A'
  };

  if (world.page) {
    await world.page.evaluate((data) => {
      const id = 'ods-screenshot-metadata-overlay';
      if (document.getElementById(id)) return;

      const footer = document.createElement('div');
      footer.id = id;

      footer.style.position = 'fixed';
      footer.style.bottom = '0';
      footer.style.left = '0';
      footer.style.width = '100%';
      footer.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
      footer.style.color = '#ffffff';
      footer.style.zIndex = '2147483647'; // Max z-index
      footer.style.fontSize = '12px';
      footer.style.fontFamily = 'monospace';
      footer.style.padding = '8px 12px';
      footer.style.display = 'flex';
      footer.style.flexWrap = 'wrap';
      footer.style.justifyContent = 'space-between';
      footer.style.boxSizing = 'border-box';
      footer.style.borderTop = '2px solid #ff4444'; // Red border

      footer.innerHTML = `
          <div style="flex-basis: 100%; margin-top: 5px; display: flex; justify-content: space-between; font-size: 14px;">
              <span><strong>Test:</strong> ${data.scenario}</span>
              <span><strong>Step:</strong> ${data.step}</span>
          </div>
          <div style="margin-right: 15px;"><strong>Repository:</strong> ${data.project}</div>
          <div style="margin-right: 15px;"><strong>Environment:</strong> ${data.env}</div>
          <div style="margin-right: 15px;"><strong>Build Number:</strong> ${data.build}</div>
          <div style="margin-right: 15px;"><strong>Time:</strong> ${data.date}</div>
          <div style="margin-right: 15px;"><strong>Commit:</strong> ${data.commit}</div>
      `;

      document.body.appendChild(footer);
    }, metadata);

    const scenarioDirName = `${scenario.pickle.name.replace(/ /g, '_')}.png`;
    const scenarioDirPath = path.join(screenshotBaseDir, scenarioDirName);
    fs.mkdirSync(scenarioDirPath, { recursive: true });
    const stepName = world.currentStepName?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown';
    const screenshotPath = path.join(scenarioDirPath, `${stepName}_.png`);
    
    await world.page.screenshot({ path: screenshotPath, type: 'png' });

    const screenshot = fs.readFileSync(screenshotPath);
    await world.attach(screenshot, 'image/png');
    world.lastScreenshot = screenshot;
  }
}