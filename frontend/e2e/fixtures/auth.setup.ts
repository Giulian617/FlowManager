import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { ENV } from "./env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_DIR = path.join(__dirname, ".auth");

fs.mkdirSync(AUTH_DIR, { recursive: true });

async function loginAs(
  page: any,
  username: string,
  password: string,
  storageFile: string
) {
  await page.goto("/");
  await page.getByPlaceholder("your username").fill(username);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page, `Login failed for ${username} — still on login page`)
    .not.toHaveURL("/", { timeout: 10_000 });

  const token = await page.evaluate(() => localStorage.getItem("accessToken"));
  expect(token, `No accessToken in localStorage after login as ${username}`).not.toBeNull();

  await page.context().storageState({ path: storageFile });
}

setup("authenticate as admin", async ({ page }) => {
  await loginAs(
    page,
    ENV.credentials.admin.username,
    ENV.credentials.admin.password,
    path.join(AUTH_DIR, "admin.json")
  );
});

setup("authenticate as manager", async ({ page }) => {
  await loginAs(
    page,
    ENV.credentials.manager.username,
    ENV.credentials.manager.password,
    path.join(AUTH_DIR, "manager.json")
  );
});

setup("authenticate as user", async ({ page }) => {
  await loginAs(
    page,
    ENV.credentials.user.username,
    ENV.credentials.user.password,
    path.join(AUTH_DIR, "user.json")
  );
});