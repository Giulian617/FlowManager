import { test, expect } from "@playwright/test";

test.describe("Error pages", () => {
  test("navigating to an unknown route shows 404 page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    // The ErrorBoundary maps 404 → "Page Not Found"
    await expect(page.getByText(/page not found/i)).toBeVisible({ timeout: 5_000 });
  });
});