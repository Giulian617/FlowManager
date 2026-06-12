import { type Page, type Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly togglePasswordButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput        = page.getByPlaceholder("your username");
    this.passwordInput        = page.getByPlaceholder("••••••••");
    this.submitButton         = page.getByRole("button", { name: /sign in/i });
    this.errorMessage         = page.getByText("Invalid username or password.");
    this.togglePasswordButton = page.locator("button[tabindex='-1']");
  }

  async goto() {
    await this.page.goto("/");
    await expect(this.submitButton).toBeVisible();
  }

  async fillCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(username: string, password: string) {
    await this.fillCredentials(username, password);
    await this.submit();
  }

  async expectError() {
    await expect(this.errorMessage).toBeVisible({ timeout: 5_000 });
  }

  async expectRedirectedAwayFromLogin() {
    await expect(this.page).not.toHaveURL("/", { timeout: 10_000 });
  }

  /** Verify the JWT was stored in localStorage after a successful login */
  async expectTokenStored() {
    const token = await this.page.evaluate(() =>
      localStorage.getItem("accessToken")
    );
    expect(token).not.toBeNull();
    expect(token!.split(".").length).toBe(3); // basic JWT shape check
  }
}