const BASE_URL = "http://localhost:8081"

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) return null

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) return null

  const data = await response.json()
  localStorage.setItem("accessToken", data.accessToken)
  localStorage.setItem("refreshToken", data.refreshToken)
  localStorage.setItem("tokenExpiry", String(Date.now() + data.expiresIn * 1000))
  return data.accessToken
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem("accessToken")

  const expiry = Number(localStorage.getItem("tokenExpiry"))
  if (expiry && Date.now() >= expiry - 30_000) {
    token = await refreshAccessToken()
    if (!token) {
      localStorage.clear()
      window.location.href = "/"
      throw new Error("Session expired")
    }
  }

  let response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (response.status === 401) {
    token = await refreshAccessToken()
    if (!token) {
      localStorage.clear()
      window.location.href = "/"
      throw new Error("Session expired")
    }

    response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers,
      },
    })
  }

  return response
}