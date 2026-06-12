import { test, expect } from "@playwright/test";
import { OrgLayoutPage } from "../../page-objects/OrgLayoutPage";

const TEST_ORG_ID   = process.env.TEST_ORG_ID   ?? "1";
const TEST_ORG_NAME = process.env.TEST_ORG_NAME ?? "Org 1";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(
    ({ orgId, orgName }) => {
      localStorage.setItem("selectedOrg", orgId);
      localStorage.setItem("selectedOrgName", orgName);
    },
    { orgId: TEST_ORG_ID, orgName: TEST_ORG_NAME }
  );
});

test.describe("Org layout sidebar", () => {
  test("all nav links are visible", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.expectSidebarVisible();
  });

  test("navigates to users page", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.usersLink.click();
    await expect(page).toHaveURL(/\/org\/users/);
  });

  test("navigates to projects page", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.projectsLink.click();
    await expect(page).toHaveURL(/\/org\/projects/);
  });

  test("navigates to teams page", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.teamsLink.click();
    await expect(page).toHaveURL(/\/org\/teams/);
  });

  test("switch organization clears org from localStorage and redirects", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.switchOrganization();

    const orgId = await page.evaluate(() => localStorage.getItem("selectedOrg"));
    expect(orgId).toBeNull();
  });

  test("org name is displayed in the sidebar header", async ({ page }) => {
    await page.goto("/org/dashboard");
    await expect(page.locator("aside")).toContainText(TEST_ORG_NAME);
  });
});

test.describe("Org layout sidebar — admin controls", () => {
  test.use({ storageState: "fixtures/.auth/admin.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/select-org");
    await page.evaluate(
      ({ orgId, orgName }) => {
        localStorage.setItem("selectedOrg", orgId);
        localStorage.setItem("selectedOrgName", orgName);
      },
      { orgId: TEST_ORG_ID, orgName: TEST_ORG_NAME }
    );
  });
  
  test("edit and delete buttons are visible for admin user", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.expectAdminControlsVisible();
  });

  test("edit modal opens and closes with Cancel", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.openEditModal();
    await layout.closeEditModalWithCancel();
  });

  test("edit modal closes when clicking the backdrop", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.openEditModal();
    await page.mouse.click(10, 10);
    await expect(layout.editModal).not.toBeVisible();
  });

  test("delete modal opens and closes with Cancel", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.openDeleteModal();
    await layout.closeDeleteModalWithCancel();
  });

  test("delete modal closes when clicking the backdrop", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.openDeleteModal();
    await page.mouse.click(10, 10);
    await expect(layout.deleteModal).not.toBeVisible();
  });

  test("delete confirm button is disabled until org name is typed", async ({ page }) => {
    const layout = new OrgLayoutPage(page);
    await layout.goto();
    await layout.openDeleteModal();
    await expect(layout.deleteConfirmButton).toBeDisabled();
    await layout.deleteConfirmInput.fill(TEST_ORG_NAME);
    await expect(layout.deleteConfirmButton).toBeEnabled();
  });
});