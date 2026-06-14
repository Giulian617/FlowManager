#!/usr/bin/env python3
"""
Idempotent Keycloak realm bootstrap for FlowManager.

Recreates (no realm export exists) the `flowmanager` realm + confidential client
+ realm roles + an app admin user on a freshly deployed Keycloak, via the Admin REST API.

All values come from environment variables so no secrets live in this file:
  KC_URL              e.g. https://flowmanager-keycloak.fly.dev
  KC_ADMIN            master-realm admin username
  KC_ADMIN_PASSWORD   master-realm admin password
  REALM               realm to create (flowmanager)
  CLIENT_ID           confidential client id (flowmanager-client)
  CLIENT_SECRET       client secret (must match KEYCLOAK_CLIENT_SECRET used by nomenclator)
  FRONTEND_URL        public frontend origin, used for redirect URIs / web origins
  APP_ADMIN_USER      app admin username to create in the realm
  APP_ADMIN_PASSWORD  app admin password
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

KC = os.environ["KC_URL"].rstrip("/")
ADMIN = os.environ["KC_ADMIN"]
ADMIN_PW = os.environ["KC_ADMIN_PASSWORD"]
REALM = os.environ.get("REALM", "flowmanager")
CLIENT_ID = os.environ.get("CLIENT_ID", "flowmanager-client")
CLIENT_SECRET = os.environ["CLIENT_SECRET"]
FRONTEND_URL = os.environ.get("FRONTEND_URL", "*").rstrip("/")
APP_ADMIN_USER = os.environ.get("APP_ADMIN_USER", "admin")
APP_ADMIN_PASSWORD = os.environ.get("APP_ADMIN_PASSWORD", "admin-pass")

ROLES = ["USER", "MANAGER", "ADMIN"]


def req(method, path, token=None, data=None, form=None):
    url = KC + path
    headers = {}
    body = None
    if form is not None:
        body = urllib.parse.urlencode(form).encode()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    elif data is not None:
        body = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = "Bearer " + token
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            raw = resp.read().decode()
            return resp.status, (json.loads(raw) if raw else None), resp.headers
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(), e.headers


def get_token():
    status, body, _ = req(
        "POST",
        "/realms/master/protocol/openid-connect/token",
        form={
            "grant_type": "password",
            "client_id": "admin-cli",
            "username": ADMIN,
            "password": ADMIN_PW,
        },
    )
    if status != 200:
        sys.exit(f"FATAL: could not get admin token ({status}): {body}")
    return body["access_token"]


def ok(status, what):
    if status in (200, 201, 204):
        print(f"  + {what}: ok ({status})")
    elif status == 409:
        print(f"  = {what}: already exists (409)")
    else:
        print(f"  ! {what}: UNEXPECTED {status}")
    return status


def main():
    token = get_token()
    print("Got admin token.")

    # 1. Realm
    print("Realm:")
    ok(req("POST", "/admin/realms", token, data={"realm": REALM, "enabled": True})[0],
       f"realm {REALM}")

    # 2. Realm roles
    print("Roles:")
    for role in ROLES:
        ok(req("POST", f"/admin/realms/{REALM}/roles", token, data={"name": role})[0], role)

    # 3. Confidential client
    print("Client:")
    client_rep = {
        "clientId": CLIENT_ID,
        "enabled": True,
        "protocol": "openid-connect",
        "publicClient": False,
        "secret": CLIENT_SECRET,
        "serviceAccountsEnabled": True,
        "directAccessGrantsEnabled": True,
        "standardFlowEnabled": True,
        "redirectUris": [f"{FRONTEND_URL}/*"],
        "webOrigins": [FRONTEND_URL if FRONTEND_URL != "*" else "+"],
    }
    ok(req("POST", f"/admin/realms/{REALM}/clients", token, data=client_rep)[0], CLIENT_ID)

    # Look up client uuid and ensure the secret matches (in case it pre-existed)
    _, clients, _ = req("GET", f"/admin/realms/{REALM}/clients?clientId={CLIENT_ID}", token)
    client_uuid = clients[0]["id"]
    req("PUT", f"/admin/realms/{REALM}/clients/{client_uuid}", token, data={
        **clients[0], "secret": CLIENT_SECRET, "serviceAccountsEnabled": True,
        "directAccessGrantsEnabled": True,
    })
    print(f"  client uuid = {client_uuid}")

    # 4. Grant realm-admin to the client's service account so nomenclator can manage users/roles
    print("Service account permissions:")
    _, sa_user, _ = req("GET", f"/admin/realms/{REALM}/clients/{client_uuid}/service-account-user", token)
    sa_id = sa_user["id"]
    _, rm_clients, _ = req("GET", f"/admin/realms/{REALM}/clients?clientId=realm-management", token)
    rm_uuid = rm_clients[0]["id"]
    _, realm_admin_role, _ = req(
        "GET", f"/admin/realms/{REALM}/clients/{rm_uuid}/roles/realm-admin", token)
    ok(req("POST", f"/admin/realms/{REALM}/users/{sa_id}/role-mappings/clients/{rm_uuid}",
           token, data=[realm_admin_role])[0], "service-account realm-admin")

    # 5. App admin user with realm role ADMIN
    print("Admin user:")
    ok(req("POST", f"/admin/realms/{REALM}/users", token, data={
        "username": APP_ADMIN_USER,
        "enabled": True,
        # email + first/last name are required by Keycloak's user profile; without them
        # a direct-grant login fails with "Account is not fully set up".
        "email": f"{APP_ADMIN_USER}@flowmanager.local",
        "firstName": "Admin",
        "lastName": "User",
        "emailVerified": True,
        "requiredActions": [],
        "credentials": [{"type": "password", "value": APP_ADMIN_PASSWORD, "temporary": False}],
    })[0], f"user {APP_ADMIN_USER}")
    _, users, _ = req("GET",
                      f"/admin/realms/{REALM}/users?username={urllib.parse.quote(APP_ADMIN_USER)}&exact=true",
                      token)
    user_id = users[0]["id"]
    _, admin_role, _ = req("GET", f"/admin/realms/{REALM}/roles/ADMIN", token)
    ok(req("POST", f"/admin/realms/{REALM}/users/{user_id}/role-mappings/realm",
           token, data=[admin_role])[0], "user ADMIN role")

    print("\nDone. Realm bootstrap complete.")


if __name__ == "__main__":
    main()
