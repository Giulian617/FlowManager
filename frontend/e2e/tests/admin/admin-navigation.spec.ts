import { test, expect } from "@playwright/test";
import { AdminMenuPage } from "../../page-objects/AdminMenuPage";
import { AdminLayoutPage } from "../../page-objects/AdminLayoutPage";

test.describe("Admin menu", () => {
  test("renders both destination cards", async ({ page }) => {
    const menu = new AdminMenuPage(page);
    await menu.goto();

    await expect(page.getByText("Select destination")).toBeVisible();
    await expect(menu.viewOrganizationsCard).toBeVisible();
    await expect(menu.viewAdminPanelCard).toBeVisible();
  });

  test("navigates to admin panel from menu", async ({ page }) => {
    const menu = new AdminMenuPage(page);
    await menu.goto();
    await menu.goToAdminPanel();
  });

  test("navigates to select-org from menu", async ({ page }) => {
    const menu = new AdminMenuPage(page);
    await menu.goto();
    await menu.goToSelectOrg();
  });
});

test.describe("Admin panel sidebar", () => {
  test("all nav links are visible", async ({ page }) => {
    const layout = new AdminLayoutPage(page);
    await page.goto("/admin/dashboard");
    await layout.expectSidebarVisible();

    await expect(layout.organizationsLink).toBeVisible();
    await expect(layout.projectsLink).toBeVisible();
    await expect(layout.teamsLink).toBeVisible();
    await expect(layout.workItemsLink).toBeVisible();
    await expect(layout.commentsLink).toBeVisible();
  });

  test("navigates to each admin section", async ({ page }) => {
    const sections = [
      "users",
      "organizations",
      "projects",
      "teams",
      "work-items",
      "comments",
    ] as const;

    for (const section of sections) {
      await page.goto(`/admin/${section}`);
      await expect(page).toHaveURL(new RegExp(`/admin/${section}`));
      // Page should not show an error boundary
      await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
    }
  });

  test("exit admin panel returns to admin-menu", async ({ page }) => {
    const layout = new AdminLayoutPage(page);
    await page.goto("/admin/dashboard");
    await layout.exitToAdminMenu();
  });

  test("active nav link is highlighted", async ({ page }) => {
    await page.goto("/admin/users");
    // Active link has bg-slate-900 applied; check via aria-current or class
    const usersLink = page.getByRole("link", { name: /^users$/i });
    // React Router sets aria-current="page" on active NavLinks
    await expect(usersLink).toHaveAttribute("aria-current", "page");
  });

  test("users link is highlighted when on users page", async ({ page }) => {
    await page.goto("/admin/organizations");
    const orgLink = page.getByRole("link", { name: /^organizations$/i });
    await expect(orgLink).toHaveAttribute("aria-current", "page");
  });
});