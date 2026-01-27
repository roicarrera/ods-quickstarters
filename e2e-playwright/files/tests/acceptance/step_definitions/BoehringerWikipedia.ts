import { Given, Then } from '../../support/bdd';
import { BoehringerWikipedia } from '../../page-objects/BoehringerWikipedia';

Given('User navigates to the Boehringer Wikipedia Page', async ({ page }) => {
    const Page = new BoehringerWikipedia(page);
    await Page.goto();
});

Then('User should see text {string} in the title', async ({ page }, title: string) => {
    const Page = new BoehringerWikipedia(page);
    await Page.verifyTitleText(title);
});
