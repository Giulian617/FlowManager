import { test, expect } from "@playwright/test";

const TEST_ORG_ID = process.env.TEST_ORG_ID ?? "1";
const TEST_ORG_NAME = process.env.TEST_ORG_NAME ?? "Org 1";

const ORG_SETUP = async ({ page }: { page: any }) => {
  await page.goto("/select-org");
  await page.evaluate(
    ({ orgId, orgName }: { orgId: string; orgName: string }) => {
      localStorage.setItem("selectedOrg", orgId);
      localStorage.setItem("selectedOrgName", orgName);
    },
    { orgId: TEST_ORG_ID, orgName: TEST_ORG_NAME }
  );
};

async function gotoAndWait(page: any, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

test.describe("Org Dashboard", () => {
  test.beforeEach(ORG_SETUP);

  test("loads with org name heading and info card", async ({ page }) => {
    await gotoAndWait(page, "/org/dashboard");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("main").getByText("Dashboard", { exact: true })).toBeVisible();
    // Org info card shows Industry, Manager, Created
    await expect(page.getByRole("main").getByText("Industry", { exact: true })).toBeVisible();
    await expect(page.getByRole("main").getByText("Manager", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("main").getByText("Created", { exact: true })).toBeVisible();
  });

  test("stat cards for Projects, Teams, Members are visible", async ({ page }) => {
    await gotoAndWait(page, "/org/dashboard");

    await expect(page.getByRole("main").getByText("Projects", { exact: true })).toBeVisible();
    await expect(page.getByRole("main").getByText("Teams", { exact: true })).toBeVisible();
    await expect(page.getByRole("main").getByText("Members", { exact: true })).toBeVisible();
  });

  test("recent activity section is visible", async ({ page }) => {
    await gotoAndWait(page, "/org/dashboard");
    await expect(page.getByText("Recent activity")).toBeVisible();
  });

  test("View projects button navigates to org projects", async ({ page }) => {
    await gotoAndWait(page, "/org/dashboard");

    await page.getByRole("button", { name: /view projects/i }).click();
    await expect(page).toHaveURL(/\/org\/projects/);
  });

  test("clicking Projects stat card navigates to org projects", async ({ page }) => {
    await gotoAndWait(page, "/org/dashboard");

    await page.getByText("View yours").first().click();
    await expect(page).toHaveURL(/\/org\/projects/);
  });

  test("clicking Teams stat card navigates to org teams", async ({ page }) => {
    await gotoAndWait(page, "/org/dashboard");

    await page.getByText("View yours").nth(1).click();
    await expect(page).toHaveURL(/\/org\/teams/);
  });
});

test.describe("Org / Projects page", () => {
  test.beforeEach(ORG_SETUP);

  test("page loads without errors", async ({ page }) => {
    await gotoAndWait(page, "/org/projects");

    await expect(page.getByRole("heading", { name: /projects/i })).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("projects card grid or empty state is visible", async ({ page }) => {
    await gotoAndWait(page, "/org/projects");

    const hasCards = await page.locator(".rounded-3xl").nth(2).isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/no projects/i).isVisible().catch(() => false);

    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test("search input is visible", async ({ page }) => {
    await gotoAndWait(page, "/org/projects");
    await expect(page.getByPlaceholder(/search by name/i)).toBeVisible();
  });
});

test.describe("Org / Teams page", () => {
  test.beforeEach(ORG_SETUP);

  test("page loads without errors", async ({ page }) => {
    await gotoAndWait(page, "/org/teams");

    await expect(page.getByRole("heading", { name: /teams/i })).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("teams card grid or empty state is visible", async ({ page }) => {
    await gotoAndWait(page, "/org/teams");

    const hasCards = await page.locator(".rounded-3xl").nth(2).isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/no teams/i).isVisible().catch(() => false);

    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test("search input is visible", async ({ page }) => {
    await gotoAndWait(page, "/org/teams");
    await expect(page.getByPlaceholder(/search by name/i)).toBeVisible();
  });
});

test.describe("Org / Users page", () => {
  test.beforeEach(ORG_SETUP);

  test("page loads without errors", async ({ page }) => {
    await gotoAndWait(page, "/org/users");

    await expect(page.getByRole("heading", { name: /users/i })).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("users card grid or empty state is visible", async ({ page }) => {
    await gotoAndWait(page, "/org/users");

    const hasCards   = await page.locator(".rounded-3xl").nth(2).isVisible().catch(() => false);
    const hasNoUsers = await page.getByText("No users found for this organization.").isVisible().catch(() => false);
    const hasNoMatch = await page.getByText("No users match your filters.").isVisible().catch(() => false);

    expect(hasCards || hasNoUsers || hasNoMatch).toBeTruthy();
  });

  test("search input is visible", async ({ page }) => {
    await gotoAndWait(page, "/org/users");
    await expect(page.getByPlaceholder("Search by name, username, email or role…")).toBeVisible();
  });
});