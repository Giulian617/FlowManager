function require(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
}

export const ENV = {
  frontendUrl:   process.env.FRONTEND_URL    ?? "http://localhost:8100",
  gatewayUrl:    process.env.GATEWAY_URL     ?? "http://localhost:8081",
  keycloakUrl:   process.env.KEYCLOAK_URL    ?? "http://localhost:8080",

  credentials: {
    admin: {
      username: process.env.TEST_ADMIN_USERNAME   ?? "",
      password: process.env.TEST_ADMIN_PASSWORD   ?? "",
    },
    manager: {
      username: process.env.TEST_MANAGER_USERNAME ?? "",
      password: process.env.TEST_MANAGER_PASSWORD ?? "",
    },
    user: {
      username: process.env.TEST_USER_USERNAME    ?? "",
      password: process.env.TEST_USER_PASSWORD    ?? "",
    },
  },
} as const;

export type Role = "admin" | "manager" | "user";