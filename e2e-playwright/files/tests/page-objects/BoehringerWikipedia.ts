import { Locator, Page, expect } from "@playwright/test";

export class BoehringerWikipedia {
  private Title: Locator;
  private url: string;

  constructor(private page: Page) {
    this.Title = this.page.locator(
      'h1 .mw-page-title-main'
    );
    const baseUrl = process.env.BASE_URL ?? 'https://es.wikipedia.org/wiki';
    this.url = `${baseUrl}/Boehringer_Ingelheim`;
  }

  async goto() {
    console.log('Navigating to Spanish Boehringer Wikipedia URL:', this.url);
    await this.page.goto(this.url, {
      waitUntil: "networkidle",
    });
    await this.Title.waitFor({ state: "visible" });
  }

  async isTitleVisible(): Promise<boolean> {
    return await this.Title.isVisible();
  }
  
  async verifyTitleText(expectedText: string): Promise<void> {
    await expect(this.Title).toHaveText(expectedText);
  }

}
