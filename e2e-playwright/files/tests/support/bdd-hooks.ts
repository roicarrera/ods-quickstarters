import fs from 'fs';
import path from 'path';
import { After, BeforeAll } from './bdd';

const sanitize = (value: string): string =>
  value.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 120);

BeforeAll(() => {
  process.env.BASE_URL ??= 'https://es.wikipedia.org/wiki';
  process.env.FORCE_COLOR ??= '0';
});

After(async ({ page, $bddContext }) => {
  const testInfo = $bddContext.testInfo;
  const dir = path.join(testInfo.outputDir, 'screenshots');
  await fs.promises.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${sanitize(testInfo.title)}_${testInfo.status}.png`);
  await page.screenshot({ path: filePath, type: 'png' });
  await testInfo.attach('screenshot', { path: filePath, contentType: 'image/png' });
});
