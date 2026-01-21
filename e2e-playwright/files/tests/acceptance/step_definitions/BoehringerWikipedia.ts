import { Given, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world';
import { BoehringerWikipedia } from '../../page-objects/BoehringerWikipedia';

Given('User navigates to the Boehringer Wikipedia Page', async function (this: CustomWorld) {
    const Page = new BoehringerWikipedia(this.page);
    await Page.goto();
});

Then('User should see text {string} in the title', async function (this: CustomWorld, title: string) {
    const Page = new BoehringerWikipedia(this.page);
    await Page.verifyTitleText(title);
});
