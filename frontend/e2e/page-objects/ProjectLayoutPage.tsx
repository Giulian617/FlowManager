import { type Page, type Locator, expect } from "@playwright/test";

export class ProjectLayoutPage {
  readonly page: Page;

  readonly dashboardLink:        Locator;
  readonly teamsLink:            Locator;
  readonly workItemsLink:        Locator;
  readonly kanbanLink:           Locator;
  readonly switchOrgButton:      Locator;
  readonly orgBreadcrumbButton:  Locator;

  constructor(page: Page) {
    this.page                 = page;
    this.dashboardLink        = page.getByRole("link", { name: /^dashboard$/i });
    this.teamsLink            = page.getByRole("link", { name: /^teams$/i });
    this.workItemsLink        = page.getByRole("link", { name: /^work items$/i });
    this.kanbanLink           = page.getByRole("link", { name: /^kanban board$/i });
    this.switchOrgButton      = page.getByRole("button", { name: /switch organization/i });
    this.orgBreadcrumbButton  = page.locator("button").filter({ hasText: /[A-Z]/ }).first();
  }

  async expectSidebarVisible() {
    await expect(this.dashboardLink).toBeVisible();
    await expect(this.workItemsLink).toBeVisible();
  }

  async goToWorkItems() {
    await this.workItemsLink.click();
    await expect(this.page).toHaveURL(/\/project\/work-items/);
  }

  async goToKanban() {
    await this.kanbanLink.click();
    await expect(this.page).toHaveURL(/\/project\/kanban/);
  }

  async switchOrganization() {
    await this.switchOrgButton.click();
    await expect(this.page).toHaveURL(/\/select-org/);
  }
}