import { test, expect } from "@playwright/test";

async function gotoAndWait(page: any, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

test.describe("TopBar", () => {
  test("settings button opens theme popup", async ({ page }) => {
    await gotoAndWait(page, "/admin/dashboard");

    await page.getByRole("button", { name: "" }).filter({ has: page.locator("svg") }).nth(1).click();
    // Settings popup has three theme buttons
    await expect(page.getByRole("button", { name: /^light$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^dark$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^system$/i })).toBeVisible();
  });

  test("profile menu opens with username, profile and logout", async ({ page }) => {
    await gotoAndWait(page, "/admin/dashboard");

    // The profile button shows the username — click it
    const profileBtn = page.locator("button").filter({ hasText: /\w+/ }).last();
    await profileBtn.click();

    await expect(page.getByRole("button", { name: /view profile/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /log out/i })).toBeVisible();
  });

  test("settings popup closes when X is clicked", async ({ page }) => {
    await gotoAndWait(page, "/admin/dashboard");

    await page.getByRole("button", { name: "" }).filter({ has: page.locator("svg") }).nth(1).click();
    await expect(page.getByRole("button", { name: /^light$/i })).toBeVisible();

    await page.locator("button").filter({ has: page.locator("svg.lucide-x") }).last().click();
    await expect(page.getByRole("button", { name: /^light$/i })).not.toBeVisible();
  });
});

test.describe("Profile page", () => {
  test("loads with personal information section", async ({ page }) => {
    await gotoAndWait(page, "/admin/profile");

    await expect(page.getByRole("heading", { name: /my profile/i })).toBeVisible();
    await expect(page.getByText("Personal Information")).toBeVisible();
  });

  test("all editable fields are present", async ({ page }) => {
    await gotoAndWait(page, "/admin/profile");

    await expect(page.getByPlaceholder("First name")).toBeVisible();
    await expect(page.getByPlaceholder("Last name")).toBeVisible();
    await expect(page.getByPlaceholder("Email address")).toBeVisible();
    await expect(page.getByPlaceholder("Phone number")).toBeVisible();
  });

  test("Save and Cancel buttons are disabled when profile is unchanged", async ({ page }) => {
    await gotoAndWait(page, "/admin/profile");

    await expect(page.getByRole("button", { name: /save changes/i })).toBeDisabled();
    await expect(page.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  test("Save button enables after editing a field", async ({ page }) => {
    await gotoAndWait(page, "/admin/profile");

    const firstNameInput = page.getByPlaceholder("First name");
    const original = await firstNameInput.inputValue();

    await firstNameInput.fill(original + "_edited");
    await expect(page.getByRole("button", { name: /save changes/i })).toBeEnabled();
    await expect(page.getByRole("button", { name: /cancel/i })).toBeEnabled();
  });

  test("Cancel reverts field to original value", async ({ page }) => {
    await gotoAndWait(page, "/admin/profile");

    const firstNameInput = page.getByPlaceholder("First name");
    const original = await firstNameInput.inputValue();

    await firstNameInput.fill("CHANGED_VALUE");
    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(firstNameInput).toHaveValue(original);
  });

  test("Role field is read-only", async ({ page }) => {
    await gotoAndWait(page, "/admin/profile");

    // Role is rendered as a non-editable div, not an input
    await expect(page.getByText("Role is managed only by your administrator.")).toBeVisible();
  });

  test("Change Password section is visible", async ({ page }) => {
    await gotoAndWait(page, "/admin/profile");

    await expect(page.getByText("Change Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /reset password/i })).toBeVisible();
  });
});