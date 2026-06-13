import { type Page, type Locator, expect } from "@playwright/test";

export class SelectOrgPage {
  readonly page: Page;

  readonly searchInput: Locator;
  readonly createOrgButton: Locator;
  readonly backToAdminMenuButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput        = page.getByPlaceholder(/search organizations/i);
    this.createOrgButton    = page.getByRole("button", { name: /create new organization/i });
    this.backToAdminMenuButton = page.getByRole("button", { name: /admin menu/i });
    this.emptyState         = page.getByText(/no organizations found/i);
  }

  async goto() {
    await this.page.goto("/select-org");
    // Wait for loading spinner to disappear
    await expect(this.page.getByText(/loading organizations/i)).not.toBeVisible({ timeout: 10_000 });
  }

  /** Returns all visible org card buttons */
  orgCards() {
    return this.page.locator("button").filter({ has: this.page.locator("p.font-semibold") });
  }

  /** Click the org card whose name matches the given string */
  async selectOrg(name: string) {
    await this.page.getByRole("button", { name: new RegExp(name, "i") }).click();
    await expect(this.page).toHaveURL(/\/org\/dashboard/, { timeout: 10_000 });
  }

  async search(term: string) {
    await this.searchInput.fill(term);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  /** Only visible for ADMIN users */
  async expectCreateButtonVisible() {
    await expect(this.createOrgButton).toBeVisible();
  }

  async expectCreateButtonHidden() {
    await expect(this.createOrgButton).not.toBeVisible();
  }

  async goBackToAdminMenu() {
    await this.backToAdminMenuButton.click();
    await expect(this.page).toHaveURL(/\/admin-menu/);
  }

  async expectOrgVisible(name: string) {
    await expect(this.page.getByRole("button", { name: new RegExp(name, "i") })).toBeVisible();
  }

  async expectOrgHidden(name: string) {
    await expect(this.page.getByRole("button", { name: new RegExp(name, "i") })).not.toBeVisible();
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  /** Verify selectedOrg was written to localStorage after picking an org */
  async expectOrgStoredInLocalStorage() {
    const orgId = await this.page.evaluate(() => localStorage.getItem("selectedOrg"));
    expect(orgId).not.toBeNull();

    const orgName = await this.page.evaluate(() => localStorage.getItem("selectedOrgName"));
    expect(orgName).not.toBeNull();
  }
}