import { test, expect } from "@playwright/test";

const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID ?? "1";
const TEST_ORG_ID     = process.env.TEST_ORG_ID     ?? "1";

const PROJECT_SETUP = async ({ page }: { page: any }) => {
  await page.goto("/");
  await page.evaluate(
    ({ projectId, orgId }: { projectId: string; orgId: string }) => {
      localStorage.setItem("selectedProject", projectId);
      localStorage.setItem("selectedOrg", orgId);
    },
    { projectId: TEST_PROJECT_ID, orgId: TEST_ORG_ID }
  );
};

async function gotoAndWait(page: any, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

test.describe("Project Dashboard", () => {
  test.beforeEach(PROJECT_SETUP);

  test("renders heading and three stat cards", async ({ page }) => {
    await gotoAndWait(page, "/project/dashboard");

    // "Dashboard" is rendered as a <p> label inside main, not an <h1>.
    // Scope to main to avoid the sidebar nav link that also contains "Dashboard".
    await expect(page.getByRole("main").getByText("Dashboard", { exact: true })).toBeVisible();
    await expect(page.getByText("Open work items")).toBeVisible();
    // Scope "Teams" to main to avoid matching the sidebar nav link.
    await expect(page.getByRole("main").getByText("Teams", { exact: true })).toBeVisible();
    await expect(page.getByText("Deadline")).toBeVisible();
  });

  test("recent activity section is visible", async ({ page }) => {
    await gotoAndWait(page, "/project/dashboard");
    await expect(page.getByText("Recent activity")).toBeVisible();
  });

  test("View work items button navigates to work items list", async ({ page }) => {
    await gotoAndWait(page, "/project/dashboard");

    await page.getByRole("button", { name: /view work items/i }).click();
    await expect(page).toHaveURL(/\/project\/work-items/);
  });

  test("clicking open work items card navigates to work items", async ({ page }) => {
    await gotoAndWait(page, "/project/dashboard");

    await page.getByText("Open work items").click();
    await expect(page).toHaveURL(/\/project\/work-items/);
  });
});

test.describe("Project / Work Items list", () => {
  test.beforeEach(PROJECT_SETUP);

  test("page loads with table and header columns", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    await expect(page.getByRole("heading", { name: /work items/i })).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /title/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /status/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /severity/i })).toBeVisible();
  });

  test("filter multiselects are present", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    await expect(page.getByText("Type: All")).toBeVisible();
    await expect(page.getByText("Status: All")).toBeVisible();
    await expect(page.getByText("Severity: All")).toBeVisible();
  });

  test("search input filters work items", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    const search = page.getByPlaceholder("Search work items…");
    await expect(search).toBeVisible();
    await search.fill("zzznomatch");

    // Expect the empty row inside the table
    await expect(page.getByText("No work items match the current filters.")).toBeVisible();
  });

  test("clear search button appears after typing", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    const search = page.getByPlaceholder("Search work items…");
    await search.fill("something");

    // The X button is a direct sibling of the input inside the search bar flex container.
    // Use the input's parent container instead of relying on a specific border-radius class.
    const searchBar = search.locator("..");
    await searchBar.getByRole("button").click();
    await expect(search).toHaveValue("");
  });
});

test.describe("Project / Work Items list — admin controls", () => {
  test.use({ storageState: "fixtures/.auth/admin.json" });

  test.beforeEach(PROJECT_SETUP);

  test("New Work Item button opens type selector modal", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    await page.getByRole("button", { name: /new work item/i }).click();
    await expect(page.getByText("Select work item type")).toBeVisible();

    // All four types
    await expect(page.getByRole("button", { name: /task/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /bug/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /user story/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /epic/i })).toBeVisible();
  });

  test("modal closes on Escape key", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    await page.getByRole("button", { name: /new work item/i }).click();
    await expect(page.getByText("Select work item type")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("Select work item type")).not.toBeVisible();
  });

  test("modal closes when clicking the backdrop", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    await page.getByRole("button", { name: /new work item/i }).click();
    await expect(page.getByText("Select work item type")).toBeVisible();

    // Click the fixed backdrop (the outer div, not the modal panel)
    await page.mouse.click(10, 10);
    await expect(page.getByText("Select work item type")).not.toBeVisible();
  });

  test("selecting Bug in modal navigates to new bug form", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    await expect(page.getByRole("button", { name: /new work item/i })).toBeVisible();
    await page.getByRole("button", { name: /new work item/i }).click();
    await expect(page.getByText("Select work item type")).toBeVisible();
    await page.getByRole("button", { name: /bug/i }).click();

    await expect(page).toHaveURL(/\/project\/work-items\/new\/bug/);
  });

  test("selecting Task in modal navigates to new task form", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    await page.getByRole("button", { name: /new work item/i }).click();
    await page.getByRole("button", { name: /task/i }).click();

    await expect(page).toHaveURL(/\/project\/work-items\/new\/task/);
  });

  test("selecting User Story in modal navigates to new user story form", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    await page.getByRole("button", { name: /new work item/i }).click();
    await page.getByRole("button", { name: /user story/i }). click();

    await expect(page).toHaveURL(/\/project\/work-items\/new\/user-story/);
  });

  test("selecting Epic in modal navigates to new epic form", async ({ page }) => {
    await gotoAndWait(page, "/project/work-items");

    await page.getByRole("button", { name: /new work item/i }).click();
    await page.getByRole("button", { name: /epic/i }).click();

    await expect(page).toHaveURL(/\/project\/work-items\/new\/epic/);
  });
});

test.describe("Project / Kanban Board", () => {
  test.beforeEach(PROJECT_SETUP);

  test("renders all five column headers", async ({ page }) => {
    await gotoAndWait(page, "/project/kanban");

    await expect(page.getByText("To Do")).toBeVisible();
    await expect(page.getByText("In Progress")).toBeVisible();
    await expect(page.getByText("Testing")).toBeVisible();
    await expect(page.getByText("Done")).toBeVisible();
    await expect(page.getByText("Closed")).toBeVisible();
  });

  test("filter bar is visible", async ({ page }) => {
    await gotoAndWait(page, "/project/kanban");

    await expect(page.getByText("Filter:")).toBeVisible();
    await expect(page.getByText("Sort by:")).toBeVisible();
  });

  test("Type filter multiselect opens and shows options", async ({ page }) => {
    await gotoAndWait(page, "/project/kanban");

    await page.getByText("Type: All").click();

    const dropdown = page.locator("ul").filter({ hasText: "Task" });
    await expect(dropdown.getByText("Task")).toBeVisible();
    await expect(dropdown.getByText("Bug")).toBeVisible();
    await expect(dropdown.getByText("User Story")).toBeVisible();
    await expect(dropdown.getByText("Epic")).toBeVisible();
  });

  test("selecting a type filter shows active filter count", async ({ page }) => {
    await gotoAndWait(page, "/project/kanban");

    await page.getByText("Type: All").click();
    await page.getByText("Bug").click();
    // Click outside to close dropdown
    await page.keyboard.press("Escape");

    await expect(page.getByText("Type: Bug")).toBeVisible();
  });

  test("clear filters button appears after selecting a filter", async ({ page }) => {
    await gotoAndWait(page, "/project/kanban");

    await page.getByText("Type: All").click();
    await page.locator("ul").filter({ hasText: "Task" }).getByText("Task").click();
    await page.mouse.click(10, 10); // triggers mousedown outside, closes dropdown

    const clearBtn = page.getByRole("button", { name: /clear filters/i });
    await expect(clearBtn).toBeVisible();

    await clearBtn.click();
    await expect(page.getByText("Type: All")).toBeVisible();
  });

  test("sort by Deadline shows direction toggle", async ({ page }) => {
    await gotoAndWait(page, "/project/kanban");

    const sortSelect = page.locator("select").filter({ hasText: "Default" });
    await sortSelect.selectOption("Deadline");

    // Asc/Desc direction button should appear
    await expect(page.getByRole("button", { name: /asc/i })).toBeVisible();
  });

  test("sort direction toggles between Asc and Desc", async ({ page }) => {
    await gotoAndWait(page, "/project/kanban");

    const sortSelect = page.locator("select").filter({ hasText: "Default" });
    await sortSelect.selectOption("Severity");

    const dirBtn = page.getByRole("button", { name: /asc/i });
    await dirBtn.click();
    await expect(page.getByRole("button", { name: /desc/i })).toBeVisible();
  });
});

test.describe("Project / Kanban Board — admin controls", () => {
  test.use({ storageState: "fixtures/.auth/admin.json" });

  test.beforeEach(PROJECT_SETUP);

  test("New Work Item button opens type selector modal", async ({ page }) => {
    await gotoAndWait(page, "/project/kanban");

    await page.getByRole("button", { name: /new work item/i }).click();
    await expect(page.getByText("Select work item type")).toBeVisible();
  });
});