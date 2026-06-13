import { type Page, type Locator, expect } from "@playwright/test";

export class AdminLayoutPage {
  readonly page: Page;

  // Sidebar nav links
  readonly dashboardLink:     Locator;
  readonly usersLink:         Locator;
  readonly organizationsLink: Locator;
  readonly projectsLink:      Locator;
  readonly teamsLink:         Locator;
  readonly workItemsLink:     Locator;
  readonly commentsLink:      Locator;
  readonly exitAdminButton:   Locator;

  constructor(page: Page) {
    this.page               = page;
    this.dashboardLink      = page.getByRole("link", { name: /^dashboard$/i });
    this.usersLink          = page.getByRole("link", { name: /^users$/i });
    this.organizationsLink  = page.getByRole("link", { name: /^organizations$/i });
    this.projectsLink       = page.getByRole("link", { name: /^projects$/i });
    this.teamsLink          = page.getByRole("link", { name: /^teams$/i });
    this.workItemsLink      = page.getByRole("link", { name: /^work items$/i });
    this.commentsLink       = page.getByRole("link", { name: /^comments$/i });
    this.exitAdminButton    = page.getByRole("button", { name: /exit admin panel/i });
  }

  async expectSidebarVisible() {
    await expect(this.dashboardLink).toBeVisible();
    await expect(this.usersLink).toBeVisible();
  }

  async navigateTo(section: "dashboard" | "users" | "organizations" | "projects" | "teams" | "work-items" | "comments") {
    await this.page.goto(`/admin/${section}`);
    await expect(this.page).toHaveURL(new RegExp(`/admin/${section}`));
  }

  async exitToAdminMenu() {
    await this.exitAdminButton.click();
    await expect(this.page).toHaveURL(/\/admin-menu/);
  }
}