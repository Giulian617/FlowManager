import apiFetch from "./utils"

export async function login(username: String, password: String) {
  const response = await apiFetch(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  if (!response.ok) throw new Error("Invalid credentials")
  return response.json();
}

export async function logout() {
  const response = await apiFetch(`/auth/logout`, {
    method: "POST",
    body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") }),
  })
  if (!response.ok) throw new Error("Failed to logout")
}