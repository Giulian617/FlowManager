import { test, expect } from "@playwright/test";
import { ProjectLayoutPage } from "../../page-objects/ProjectLayoutPage";

const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID ?? "1";
const TEST_ORG_ID     = process.env.TEST_ORG_ID     ?? "1";

test.beforeEach(async ({ page }) => {
  // Seed the localStorage keys the project layout reads on mount
  await page.goto("/");
  await page.evaluate(
    ({ projectId, orgId }) => {
      localStorage.setItem("selectedProject", projectId);
      localStorage.setItem("selectedOrg", orgId);
    },
    { projectId: TEST_PROJECT_ID, orgId: TEST_ORG_ID }
  );
});

test.describe("Project layout sidebar", () => {
  test("all nav links are visible", async ({ page }) => {
    const layout = new ProjectLayoutPage(page);
    await page.goto("/project/dashboard");
    await layout.expectSidebarVisible();

    await expect(layout.teamsLink).toBeVisible();
    await expect(layout.kanbanLink).toBeVisible();
  });

  test("navigates to work items", async ({ page }) => {
    const layout = new ProjectLayoutPage(page);
    await page.goto("/project/dashboard");
    await layout.goToWorkItems();
  });

  test("navigates to kanban board", async ({ page }) => {
    const layout = new ProjectLayoutPage(page);
    await page.goto("/project/dashboard");
    await layout.goToKanban();
  });

  test("switch organization clears project from localStorage and redirects", async ({ page }) => {
    const layout = new ProjectLayoutPage(page);
    await page.goto("/project/dashboard");
    await layout.switchOrganization();

    const projectId = await page.evaluate(() =>
      localStorage.getItem("selectedProject")
    );
    expect(projectId).toBeNull();
  });

  test("org breadcrumb navigates to org dashboard", async ({ page }) => {
    await page.goto("/project/dashboard");

    const orgButton = page.locator("aside").getByText(process.env.TEST_ORG_NAME ?? "Test Org");
    await orgButton.click();
    await expect(page).toHaveURL(/\/org\/dashboard/);
  });
});