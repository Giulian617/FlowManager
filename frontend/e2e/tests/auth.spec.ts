import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";
import { ENV } from "../fixtures/env";

test.describe("Login page", () => {
  test("renders all expected elements", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(page.getByText("FlowManager")).toBeVisible();
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(login.usernameInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.submitButton).toBeVisible();
    await expect(login.submitButton).toBeDisabled(); // disabled until fields filled
  });

  test("submit button enables only when both fields have valid input", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    // Only username
    await login.usernameInput.fill("someuser");
    await expect(login.submitButton).toBeDisabled();

    // Add short password (< 3 chars)
    await login.passwordInput.fill("ab");
    await expect(login.submitButton).toBeDisabled();

    // Password meets min length
    await login.passwordInput.fill("abc");
    await expect(login.submitButton).toBeEnabled();
  });

  test("shows validation error when username is blurred empty", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.usernameInput.focus();
    await login.usernameInput.blur();
    await expect(page.getByText(/username is required/i)).toBeVisible();
  });

  test("shows validation error when password is blurred too short", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.passwordInput.focus();
    await login.passwordInput.fill("ab");
    await login.passwordInput.blur();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test("toggles password visibility", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.passwordInput.fill("secret123");
    await expect(login.passwordInput).toHaveAttribute("type", "password");

    await login.togglePasswordButton.click();
    await expect(login.passwordInput).toHaveAttribute("type", "text");

    await login.togglePasswordButton.click();
    await expect(login.passwordInput).toHaveAttribute("type", "password");
  });

  test("shows error on bad credentials", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.login("wrong_user", "wrong_pass");
    await login.expectError();
    // Should stay on login page
    await expect(page).toHaveURL("/");
  });

  test("admin user is redirected to /admin-menu after login", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.login(ENV.credentials.admin.username, ENV.credentials.admin.password);
    await login.expectRedirectedAwayFromLogin();
    await expect(page).toHaveURL(/\/admin-menu/);
    await login.expectTokenStored();
  });

  test("non-admin user is redirected to /select-org after login", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.login(ENV.credentials.user.username, ENV.credentials.user.password);
    await login.expectRedirectedAwayFromLogin();
    await expect(page).toHaveURL(/\/select-org/);
    await login.expectTokenStored();
  });

  test("already-logged-in admin visiting / is redirected to /admin-menu", async ({ page }) => {
    // First login
    const login = new LoginPage(page);
    await login.goto();
    await login.login(ENV.credentials.admin.username, ENV.credentials.admin.password);
    await expect(page).toHaveURL(/\/admin-menu/);

    // Navigate back to root
    await page.goto("/");
    await expect(page).toHaveURL(/\/admin-menu/);
  });
});