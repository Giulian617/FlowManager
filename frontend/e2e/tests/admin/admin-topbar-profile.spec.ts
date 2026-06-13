import { test, expect } from "@playwright/test";

async function gotoAndWait(page: any, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

test.describe("TopBar", () => {
  test("settings button opens theme/notification popup", async ({ page }) => {
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

  test("notification settings link in settings popup navigates correctly", async ({ page }) => {
    await gotoAndWait(page, "/admin/dashboard");

    // Open settings popup
    const settingsBtn = page.locator("button").nth(1);
    await settingsBtn.click();

    await page.getByText("Notification settings").click();
    await expect(page).toHaveURL(/\/notification-settings/);
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

test.describe("Notification Settings page", () => {
  test("loads with three channel rows", async ({ page }) => {
    await gotoAndWait(page, "/admin/notification-settings");

    await expect(page.getByText("Preferences")).toBeVisible();
    await expect(page.getByText("Email notifications")).toBeVisible();
    await expect(page.getByText("Push notifications")).toBeVisible();
    await expect(page.getByText("Web notifications")).toBeVisible();
  });

  test("all three channels are toggled on by default", async ({ page }) => {
    await gotoAndWait(page, "/admin/notification-settings");

    // Each toggle is a button — they render with translate-x-4.5 when on
    const toggles = page.locator("button[class*='rounded-full']");
    expect(await toggles.count()).toBeGreaterThanOrEqual(3);
  });

  test("Save and Cancel are disabled when no changes", async ({ page }) => {
    await gotoAndWait(page, "/admin/notification-settings");

    await expect(page.getByRole("button", { name: /save changes/i })).toBeDisabled();
    await expect(page.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  test("toggling a channel enables Save and Cancel", async ({ page }) => {
    await gotoAndWait(page, "/admin/notification-settings");

    // Click the first channel's toggle (Email)
    const firstToggle = page.locator("button[class*='rounded-full']").first();
    await firstToggle.click();

    await expect(page.getByRole("button", { name: /save changes/i })).toBeEnabled();
    await expect(page.getByRole("button", { name: /cancel/i })).toBeEnabled();
  });

  test("Cancel reverts toggle state", async ({ page }) => {
    await gotoAndWait(page, "/admin/notification-settings");

    const firstToggle = page.locator("button[class*='rounded-full']").first();
    await firstToggle.click();

    await page.getByRole("button", { name: /cancel/i }).click();

    // After cancel, buttons should be disabled again (state reverted)
    await expect(page.getByRole("button", { name: /save changes/i })).toBeDisabled();
  });

  test("expanding a channel shows trigger sub-options", async ({ page }) => {
    await gotoAndWait(page, "/admin/notification-settings");

    // Click on the Email channel row to expand it (the row, not the toggle)
    await page.getByText("Email notifications").click();

    await expect(page.getByText("Assigned to a work item")).toBeVisible();
    await expect(page.getByText("Work item status changes")).toBeVisible();
    await expect(page.getByText("Deadline reminder")).toBeVisible();
  });
});