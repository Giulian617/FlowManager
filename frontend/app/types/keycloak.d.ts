declare module "keycloak-js" {
  const Keycloak: any
  export default Keycloak
}

declare module "@react-keycloak/web" {
  import { ComponentType } from "react"
  export const ReactKeycloakProvider: ComponentType<any>
  export function useKeycloak(): { keycloak: any; initialized: boolean }
}
