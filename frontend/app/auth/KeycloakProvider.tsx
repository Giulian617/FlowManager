import React, { useEffect, useState } from "react"
import { ReactKeycloakProvider } from "@react-keycloak/web"

const kcConfig = {
  url: (import.meta.env.VITE_KEYCLOAK_URL as string) || "http://localhost:8080",
  realm: (import.meta.env.VITE_KEYCLOAK_REALM as string) || "flowmanager",
  clientId: (import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string) || "flowmanager-frontend",
}

const keycloakStub: any = {
  authenticated: false,
  token: undefined,
  tokenParsed: undefined,
  subject: undefined,
  init: async () => false,
  login: () => {},
  logout: () => {},
  updateToken: async () => true,
  on: () => {},
  off: () => {},
}

export default function KeycloakProviderWrapper({ children }: { children: React.ReactNode }) {
  const isServer = typeof window === "undefined"
  const [authClient, setAuthClient] = useState<any>(isServer ? keycloakStub : keycloakStub)

  useEffect(() => {
    let mounted = true

    import("keycloak-js")
      .then((mod) => {
        const Keycloak = mod.default
        const kc = new Keycloak({ url: kcConfig.url, realm: kcConfig.realm, clientId: kcConfig.clientId })
        if (mounted) setAuthClient(kc)

        // start periodic refresh when kc is initialized in the client
        const REFRESH_INTERVAL_MS = 60 * 1000
        let refreshHandle: number | null = null
        const startRefresh = () => {
          if (refreshHandle) window.clearInterval(refreshHandle)
          refreshHandle = window.setInterval(async () => {
            try {
              await kc.updateToken(30).catch((e: any) => {
                console.debug("Keycloak token refresh failed", e)
              })
            } catch (err) {
              console.debug("Error refreshing token", err)
            }
          }, REFRESH_INTERVAL_MS)
        }
        startRefresh()
      })
      .catch((e) => {
        console.debug("Failed to load keycloak-js", e)
      })

    return () => {
      mounted = false
    }
  }, [])

  const initOptions =
    typeof window !== "undefined"
      ? { onLoad: "check-sso", silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html" }
      : {}

  return (
    <ReactKeycloakProvider
      authClient={authClient}
      initOptions={initOptions}
      onEvent={(event: any, error: any) => {
        console.debug("Keycloak event", event, error)
      }}
      onTokens={(tokens: any) => {
        // tokens updated
      }}
    >
      {children}
    </ReactKeycloakProvider>
  )
}

