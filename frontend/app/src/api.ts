import type {
  OrganizationCreateDto,
  OrganizationUpdateDto
} from "../types/organization"
import type {
  ProjectCreateDto,
  ProjectUpdateDto
} from "../types/project"

const BASE_URL = "http://localhost:8081"

export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken")
  const expiry = localStorage.getItem("tokenExpiry")

  if (!token || !expiry) return false
  if (Date.now() > Number(expiry)) return false

  return true
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

export async function apiFetch(url: string, options: RequestInit = {}) {
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

export async function getCurrentUser() {
  const response = await apiFetch("/users/me")

  if (!response.ok) {
    throw new Error("Failed to fetch user")
  }

  return response.json()
}

export async function getManagers() {
  const response = await apiFetch("/users?role=MANAGER")

  if (!response.ok) {
    throw new Error("Failed to fetch managers")
  }

  return response.json()
}

export async function getUserOrganizations(userId: number) {
  const response = await apiFetch(`/users/${userId}/organizations/assignee`)

  if (!response.ok) {
    throw new Error("Failed to fetch organizations")
  }

  return response.json()
}

export async function getOrganizations() {
  const response = await apiFetch("/organizations")

  if (!response.ok) {
    throw new Error("Failed to fetch organizations")
  }

  return response.json()
}

export async function getOrganizationById(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch organization")
  }

  return response.json()
}

export async function getProjectsByOrganizationId(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}/projects`)

  if (!response.ok) {
    throw new Error("Failed to fetch projects")
  }

  return response.json()
}

export async function getTeamsByOrganizationId(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}/teams`)

  if (!response.ok) {
    throw new Error("Failed to fetch teams")
  }

  return response.json()
}

export async function getUsersByOrganizationId(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}/users`)

  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }

  return response.json()
}

export async function getWorkItemsByOrganizationId(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}/work-items`)

  if (!response.ok) {
    throw new Error("Failed to fetch work items")
  }

  return response.json()
}

export async function createOrganization(data: OrganizationCreateDto) {
  const response = await apiFetch("/organizations", {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to create organization")
  }

  return response.json()
}

export async function updateOrganization(orgId: number, data: OrganizationUpdateDto) {
  const response = await apiFetch(`/organizations/${orgId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to update organization")
  }

  return response.json()
}

export async function deleteOrganization(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete organization")
  }
}

export async function createProject(orgId: number, data: ProjectCreateDto) {
  const response = await apiFetch(`/projects`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create project")
  return response.json()
}

export async function updateProject(projectId: number, data: ProjectUpdateDto) {
  const response = await apiFetch(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update project")
  return response.json()
}

export async function deleteProject(projectId: number) {
  const response = await apiFetch(`/projects/${projectId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete project")
}