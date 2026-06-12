import { type Page, type Locator, expect } from "@playwright/test";

export class AdminMenuPage {
  readonly page: Page;
  readonly viewOrganizationsCard: Locator;
  readonly viewAdminPanelCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.viewOrganizationsCard = page.getByRole("button", { name: /view organizations/i });
    this.viewAdminPanelCard    = page.getByRole("button", { name: /view dashboard/i });
  }

  async goto() {
    await this.page.goto("/admin-menu");
    await expect(this.viewOrganizationsCard).toBeVisible();
  }

  async goToAdminPanel() {
    await this.viewAdminPanelCard.click();
    await expect(this.page).toHaveURL(/\/admin\/dashboard/);
  }

  async goToSelectOrg() {
    await this.viewOrganizationsCard.click();
    await expect(this.page).toHaveURL(/\/select-org/);
  }
}