import { test, expect } from "@playwright/test";

async function gotoAndWait(page: any, url: string) {
  await page.goto("/");
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

test.describe("Admin / Users page", () => {
  test("page loads without errors", async ({ page }) => {
    await gotoAndWait(page, "/admin/users");
    await expect(page.getByRole("heading", { name: /all users/i })).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("users card grid or empty state is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/users");

    // Users renders a card-per-user grid — each card has an initials avatar
    // The empty state uses one of two specific strings
    const hasCards   = await page.locator(".rounded-3xl").nth(2).isVisible().catch(() => false);
    const hasNoUsers = await page.getByText("No users found for this organization.").isVisible().catch(() => false);
    const hasNoMatch = await page.getByText("No users match your filters.").isVisible().catch(() => false);

    expect(hasCards || hasNoUsers || hasNoMatch).toBeTruthy();
  });

  test("filter bar is visible with role and status selects", async ({ page }) => {
    await gotoAndWait(page, "/admin/users");

    await expect(page.getByRole("combobox", { name: "" }).first()).toBeVisible();
    // Role filter select has "All roles" as default option
    const roleSelect = page.locator("select").filter({ hasText: "All roles" });
    await expect(roleSelect).toBeVisible();
  });

  test("search input is visible and accepts text", async ({ page }) => {
    await gotoAndWait(page, "/admin/users");

    const search = page.getByPlaceholder("Search by name, username, email or role…");
    await expect(search).toBeVisible();
    await search.fill("test");
    await expect(search).toHaveValue("test");
  });

  test("New User button is visible for admin", async ({ page }) => {
    await gotoAndWait(page, "/admin/users");
    await expect(page.getByRole("button", { name: /new user/i })).toBeVisible();
  });
});

test.describe("Admin / Organizations page", () => {
  test("page loads without errors", async ({ page }) => {
    await gotoAndWait(page, "/admin/organizations");
    await expect(page.getByRole("heading", { name: /organizations/i })).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("organizations card grid or empty state is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/organizations");

    const hasCards = await page.locator(".rounded-3xl").nth(2).isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/no organizations/i).isVisible().catch(() => false);

    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test("search input is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/organizations");
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test("New Organization button opens create modal", async ({ page }) => {
    await gotoAndWait(page, "/admin/organizations");

    await page.getByRole("button", { name: /new organization/i }).click();
    await expect(page.getByRole("heading", { name: /create organization/i })).toBeVisible();
  });

  test("create modal closes on Cancel", async ({ page }) => {
    await gotoAndWait(page, "/admin/organizations");

    await page.getByRole("button", { name: /new organization/i }).click();
    await expect(page.getByRole("heading", { name: /create organization/i })).toBeVisible();

    await page.getByRole("button", { name: /^cancel$/i }).click();
    await expect(page.getByRole("heading", { name: /create organization/i })).not.toBeVisible();
  });

  test("create modal Save is disabled while fields are empty", async ({ page }) => {
    await gotoAndWait(page, "/admin/organizations");

    await page.getByRole("button", { name: /new organization/i }).click();
    const saveBtn = page.getByRole("button", { name: /create organization/i });
    await expect(saveBtn).toBeDisabled();
  });
});

test.describe("Admin / Projects page", () => {
  test("page loads without errors", async ({ page }) => {
    await gotoAndWait(page, "/admin/projects");
    await expect(page.getByRole("heading", { name: /projects/i })).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("projects card grid or empty state is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/projects");

    const hasCards = await page.locator(".rounded-3xl").nth(2).isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/no projects/i).isVisible().catch(() => false);

    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test("search input is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/projects");
    await expect(page.getByPlaceholder(/search by name/i)).toBeVisible();
  });

  test("sort select has expected options", async ({ page }) => {
    await gotoAndWait(page, "/admin/projects");

    const sortSelect = page.locator("select").filter({ hasText: "Default" }).first();
    await expect(sortSelect).toBeVisible();
    await expect(sortSelect.locator("option", { hasText: "Name" })).toHaveCount(1);
    await expect(sortSelect.locator("option", { hasText: "Start date" })).toHaveCount(1);
    await expect(sortSelect.locator("option", { hasText: "End date" })).toHaveCount(1);
  });
});

test.describe("Admin / Teams page", () => {
  test("page loads without errors", async ({ page }) => {
    await gotoAndWait(page, "/admin/teams");
    await expect(page.getByRole("heading", { name: /teams/i })).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("teams card grid or empty state is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/teams");

    const hasCards = await page.locator(".rounded-3xl").nth(2).isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/no teams/i).isVisible().catch(() => false);

    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test("search input is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/teams");
    await expect(page.getByPlaceholder(/search by name/i)).toBeVisible();
  });
});


test.describe("Admin / Work Items page", () => {
  test.beforeEach(async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID ?? "1";
    const orgId     = process.env.TEST_ORG_ID     ?? "1";
    await page.goto("/");
    await page.evaluate(({ projectId, orgId }) => {
        localStorage.setItem("selectedProject", projectId);
        localStorage.setItem("selectedOrg",     orgId);
      },
      { projectId, orgId }
    );
  });

  test("page loads without errors", async ({ page }) => {
    await gotoAndWait(page, "/admin/work-items");
    await expect(page.getByRole("heading", { name: /work items/i })).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("work items table is rendered", async ({ page }) => {
    await gotoAndWait(page, "/admin/work-items");

    // WorkItems always renders a <table> (even with zero rows it renders the header)
    await expect(page.locator("table")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /title/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /status/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /severity/i })).toBeVisible();
  });

  test("filter bar has Type, Status, Severity multiselects", async ({ page }) => {
    await gotoAndWait(page, "/admin/work-items");

    await expect(page.getByText("Type: All")).toBeVisible();
    await expect(page.getByText("Status: All")).toBeVisible();
    await expect(page.getByText("Severity: All")).toBeVisible();
  });

  test("search input is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/work-items");
    await expect(page.getByPlaceholder("Search work items…")).toBeVisible();
  });

  test("New Work Item button is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/work-items");
    await expect(page.getByRole("button", { name: /new work item/i })).toBeVisible();
  });

  test("New Work Item button opens type selector modal", async ({ page }) => {
    await gotoAndWait(page, "/admin/work-items");

    await page.getByRole("button", { name: /new work item/i }).click();
    await expect(page.getByText("Select work item type")).toBeVisible();

    await expect(page.getByRole("button", { name: /task/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /bug/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /user story/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /epic/i })).toBeVisible();
  });

  test("type selector modal closes on Escape", async ({ page }) => {
    await gotoAndWait(page, "/admin/work-items");

    await page.getByRole("button", { name: /new work item/i }).click();
    await expect(page.getByText("Select work item type")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("Select work item type")).not.toBeVisible();
  });
});

test.describe("Admin / Comments page", () => {
  test("page loads without errors", async ({ page }) => {
    await gotoAndWait(page, "/admin/comments");
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("comments table or empty state is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/comments");

    const hasComments = await page.locator(".rounded-3xl").nth(2).isVisible().catch(() => false);
    const hasNoComments = await page.getByText("No comments yet.").isVisible().catch(() => false);
    const hasNoMatch = await page.getByText("No comments match your filters.").isVisible().catch(() => false);

    expect(hasComments || hasNoComments || hasNoMatch).toBeTruthy();
  });
});

test.describe("Admin / Dashboard", () => {
  test("stat cards are all visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/dashboard");

    await expect(page.getByText("Admin Dashboard")).toBeVisible();

    const grid = page.locator(".grid");
    await expect(grid.getByText("Users")).toBeVisible();
    await expect(grid.getByText("Organizations")).toBeVisible();
    await expect(grid.getByText("Projects")).toBeVisible();
    await expect(grid.getByText("Teams")).toBeVisible();
    await expect(grid.getByText("Work Items")).toBeVisible();
    await expect(grid.getByText("Comments")).toBeVisible();
  });

  test("each stat card has a View all link", async ({ page }) => {
    await gotoAndWait(page, "/admin/dashboard");

    const viewAllLinks = page.getByText("View all");
    await expect(viewAllLinks.first()).toBeVisible();
    expect(await viewAllLinks.count()).toBe(6);
  });

  test("clicking Users card navigates to /admin/users", async ({ page }) => {
    await gotoAndWait(page, "/admin/dashboard");

    // Each card is a clickable div — find the one containing "Users" label
    await page.getByText("Users").first().click();
    await expect(page).toHaveURL(/\/admin\/users/);
  });
});