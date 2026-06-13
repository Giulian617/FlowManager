import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_AUTH   = path.join(__dirname, "fixtures/.auth/admin.json");
const MANAGER_AUTH = path.join(__dirname, "fixtures/.auth/manager.json");
const USER_AUTH    = path.join(__dirname, "fixtures/.auth/user.json");

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  testDir: ".",
  fullyParallel: false, // auth state is shared; keep sequential to avoid token races
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

  use: {
    baseURL: process.env.FRONTEND_URL ?? "http://localhost:8100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },

  projects: [
    {
      name: "setup:auth",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "admin",
      testMatch: /tests\/admin\/.*\.spec\.ts/,
      dependencies: ["setup:auth"],
      use: { ...devices["Desktop Chrome"], storageState: ADMIN_AUTH },
    },
    {
      name: "manager",
      testMatch: /tests\/manager\/.*\.spec\.ts/,
      dependencies: ["setup:auth"],
      use: { ...devices["Desktop Chrome"], storageState: MANAGER_AUTH },
    },
    {
      name: "user",
      testMatch: /tests\/user\/.*\.spec\.ts/,
      dependencies: ["setup:auth"],
      use: { ...devices["Desktop Chrome"], storageState: USER_AUTH },
    },
    {
      name: "auth",
      testMatch: /tests\/auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});