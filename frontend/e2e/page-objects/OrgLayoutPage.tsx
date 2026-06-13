import { type Page, type Locator, expect } from "@playwright/test";

export class OrgLayoutPage {
  readonly page: Page;

  // Sidebar nav links
  readonly dashboardLink:      Locator;
  readonly usersLink:          Locator;
  readonly projectsLink:       Locator;
  readonly teamsLink:          Locator;
  readonly switchOrgButton:    Locator;

  // Admin-only controls in the sidebar header
  readonly editOrgButton:      Locator;
  readonly deleteOrgButton:    Locator;

  // Edit modal
  readonly editModal:          Locator;
  readonly editNameInput:      Locator;
  readonly editDescInput:      Locator;
  readonly editIndustrySelect: Locator;
  readonly editManagerSelect:  Locator;
  readonly editSaveButton:     Locator;
  readonly editCancelButton:   Locator;

  // Delete modal
  readonly deleteModal:        Locator;
  readonly deleteConfirmInput: Locator;
  readonly deleteConfirmButton:Locator;
  readonly deleteCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dashboardLink   = page.getByRole("link", { name: /^dashboard$/i });
    this.usersLink       = page.getByRole("link", { name: /^users$/i });
    this.projectsLink    = page.getByRole("link", { name: /^projects$/i });
    this.teamsLink       = page.getByRole("link", { name: /^teams$/i });
    this.switchOrgButton = page.getByRole("button", { name: /switch organization/i });

    // Pencil / trash icon buttons in the sidebar header (admin only)
    this.editOrgButton   = page.locator("button[title='Edit organization']");
    this.deleteOrgButton = page.locator("button[title='Delete organization']");

    // Edit modal
    this.editModal          = page.getByRole("heading", { name: /edit organization/i });
    this.editNameInput      = page.getByPlaceholder(/name/i).first();
    this.editDescInput      = page.locator("textarea");
    this.editIndustrySelect = page.locator("select").nth(0);
    this.editManagerSelect  = page.locator("select").nth(1);
    this.editSaveButton     = page.getByRole("button", { name: /save changes/i });
    this.editCancelButton   = page.getByRole("button", { name: /^cancel$/i });

    // Delete modal
    this.deleteModal         = page.getByRole("heading", { name: /delete organization/i });
    this.deleteConfirmInput  = page.getByPlaceholder(/type the organization name/i);
    this.deleteConfirmButton = page.getByRole("button", { name: /^delete$/i });
    this.deleteCancelButton  = page.getByRole("button", { name: /^cancel$/i });
  }

  async goto() {
    await this.page.goto("/org/dashboard");
    await expect(this.dashboardLink).toBeVisible();
  }

  async expectSidebarVisible() {
    await expect(this.dashboardLink).toBeVisible();
    await expect(this.usersLink).toBeVisible();
    await expect(this.projectsLink).toBeVisible();
    await expect(this.teamsLink).toBeVisible();
  }

  /** Admin-only: pencil and trash buttons should be visible */
  async expectAdminControlsVisible() {
    await expect(this.editOrgButton).toBeVisible();
    await expect(this.deleteOrgButton).toBeVisible();
  }

  /** Non-admin: pencil and trash buttons should not be present */
  async expectAdminControlsHidden() {
    await expect(this.editOrgButton).not.toBeVisible();
    await expect(this.deleteOrgButton).not.toBeVisible();
  }

  async openEditModal() {
    await this.editOrgButton.click();
    await expect(this.editModal).toBeVisible();
  }

  async closeEditModalWithCancel() {
    await this.editCancelButton.click();
    await expect(this.editModal).not.toBeVisible();
  }

  async openDeleteModal() {
    await this.deleteOrgButton.click();
    await expect(this.deleteModal).toBeVisible();
  }

  async closeDeleteModalWithCancel() {
    await this.deleteCancelButton.click();
    await expect(this.deleteModal).not.toBeVisible();
  }

  async switchOrganization() {
    await this.switchOrgButton.click();
    await expect(this.page).toHaveURL(/\/select-org/);
  }
}