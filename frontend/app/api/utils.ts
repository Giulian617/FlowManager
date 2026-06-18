import type { Page, PageParams } from "../types/page"

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081"

export function buildQuery(params: PageParams): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, String(v)))
    else qs.append(key, String(value))
  }
  const s = qs.toString()
  return s ? `?${s}` : ""
}

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

export default async function apiFetch(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem("accessToken")

  const expiry = Number(localStorage.getItem("tokenExpiry"))
  if (expiry && Date.now() >= expiry - 30_000) {
    token = await refreshAccessToken()
    if (!token) {
      localStorage.clear()
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
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
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
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

export async function fetchAllPages<T = any>(
  path: string,
  params: PageParams = {},
  pageSize = 200
): Promise<T[]> {
  const fetchPage = async (page: number): Promise<Page<T>> => {
    const response = await apiFetch(`${path}${buildQuery({ ...params, page, size: pageSize })}`)
    if (!response.ok) throw new Error(`Failed to fetch ${path}`)
    return response.json()
  }

  const first = await fetchPage(0)
  const all = [...first.content]
  if (first.totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, i) => fetchPage(i + 1))
    )
    rest.forEach((p) => all.push(...p.content))
  }
  return all
}