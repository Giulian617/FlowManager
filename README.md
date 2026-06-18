# FlowManager

Aplicatia este o platforma de management al proiectelor si, implicit, al task-urilor, similara cu aplicatia [Jira](https://www.atlassian.com/software/jira). Aceasta permite companiilor sa creeze mai multe proiecte, pe care sa le asigneze la diverse echipe.

In cadrul proiectelor se pot crea task-uri, care pot fi atribuite utilizatorilor. Managerii au posibilitatea urmaririi statusului acestora in timp real si primesc notificari cand acesta se modifica. In caz ca acestia nu sunt multumiti de rezultatul final sau gasesc o problema pot crea un work item de tip bug, pe care sa-l atribuie utilizatorilor, pentru a-l rezolva. De asemenea, utilizatorii pot lasa comentarii in cadrul task-urilor, pentru a primi clarificari.

Aplicatia ofera si un dashboard interactiv, care permite vizualizarea progresului proiectului prin statistici relevante (task-uri finalizate, in progres, restante), oferind managerilor o imagine de ansamblu asupra evolutiei proiectului.

Pentru o experienta vizuala imbunatatita, aplicatia include si un board de tip Kanban, unde task-urile pot fi gestionate prin drag & drop intre diferite coloane corespunzatoare statusurilor.

### Aplicatia poate fi accesata la acest [link](https://flowmanager-frontend.fly.dev). 

# Roluri
Aplicatia contine mai multe roluri:
- User: foloseste aplicatia pentru a vedea ce trebuie sa faca la locul de munca si a raporta progresul facut
- Manager: creeaza echipe si task-uri, pe care le atribuie ulterior utilizatorilor
- Admin: asigura bunul mers al aplicatiei

# Functionalitati principale
- Serviciu de autentificare
- Crearea unui proiect si adaugarea echipelor care lucreaza la proiect
- Crearea task-urilor si asignarea lor
- Schimbarea statusului unui task
- Adaugarea de comentarii la task-uri
- Dashboard cu statistici si progresul proiectului

# Arhitectura aplicatiei
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/architecture_diagram.png)

# Diagram Entitate-Relatie
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/entity_relationship_diagram.png)

# Setup instructions

## 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- `python3` (only for the one-time Keycloak realm seeding in step 4)

## 2. Create a `.env` file from `.env.example` and fill it in

| Variable | Description |
|---|---|
| `KEYCLOAK_DB_NAME` | Postgres database name for Keycloak (default `keycloak`) |
| `KEYCLOAK_DB_USER` | Postgres user for the Keycloak database |
| `KEYCLOAK_DB_PASS` | Postgres password for the Keycloak database |
| `KEYCLOAK_ADMIN` | Keycloak admin-console username |
| `KEYCLOAK_ADMIN_PASS` | Keycloak admin-console password |
| `KEYCLOAK_CLIENT_SECRET` | Secret for the confidential client `flowmanager-client` (must match step 4) |
| `GF_SECURITY_ADMIN_PASSWORD` | Grafana admin password |
| `DB_NAME` | MySQL application database name (default `nomenclator`) |
| `DB_USER` | MySQL application database user |
| `DB_PASS` | Password for the application database user |
| `DB_ROOT_PASS` | Root password for the MySQL container |
| `GATEWAY_SECRET` | Shared secret the api-gateway sends to nomenclator on forwarded requests |

Optional (only if you aren't using the default `localhost` ports) — these are baked
into the frontend bundle at build time:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Public URL of the api-gateway (default `http://localhost:8081`) |
| `VITE_KEYCLOAK_URL` | Public URL of Keycloak (default `http://localhost:8080`) |

## 3. Run the stack

The application modules build from source, so include `--build` the first time:

```sh
docker compose up -d --build
```

This starts everything: Postgres + Keycloak, MySQL, Redis, Prometheus, Grafana,
Zipkin, and the three app modules (`nomenclator`, `api-gateway`, `frontend`).

## 4. Seed Keycloak and create the first admin (first run only)

Login won't work until the `flowmanager` realm + confidential client + roles exist
in Keycloak, **and** an admin user exists in *both* Keycloak and the application
database (the frontend's `/users/me` lookup reads the app DB).

### 4.1 Seed the realm, client and roles
Once the `keycloak` container is up, run the bundled bootstrap script against the
local Keycloak. Replace every `<...>` with the matching value from your `.env`:

```sh
KC_URL=http://localhost:8080 \
KC_ADMIN=<KEYCLOAK_ADMIN> KC_ADMIN_PASSWORD=<KEYCLOAK_ADMIN_PASS> \
REALM=flowmanager CLIENT_ID=flowmanager-client \
CLIENT_SECRET=<KEYCLOAK_CLIENT_SECRET> \
FRONTEND_URL=http://localhost:8100 \
APP_ADMIN_USER=<bootstrap-admin> APP_ADMIN_PASSWORD=<bootstrap-password> \
python3 deploy/keycloak/setup-realm.py
```

It is idempotent — safe to re-run. `KC_ADMIN`/`KC_ADMIN_PASSWORD` must match
`KEYCLOAK_ADMIN`/`KEYCLOAK_ADMIN_PASS` and `CLIENT_SECRET` must match
`KEYCLOAK_CLIENT_SECRET` from your `.env`. The script also applies the realm login
settings below.

> Prefer the console? Skip the script and, at <http://localhost:8080>, create the
> realm `flowmanager`, a confidential client `flowmanager-client` (Direct access
> grants + Service accounts enabled, secret = `KEYCLOAK_CLIENT_SECRET`, with the
> `realm-management` → `realm-admin` role on its service account), the realm roles
> `USER`/`MANAGER`/`ADMIN`, and a bootstrap user (with email + first/last name)
> holding `ADMIN`.
>
> Then, under **Realm settings → Login**, set:
> - **Email as username:** Off — usernames are their own value, not the email.
> - **Edit username:** On — required to change a user's username later.
> - **Verify email:** Off — no email-verification / profile-completion prompt after login.

This **bootstrap admin** exists only in Keycloak — it can obtain a token and call
the API, but it cannot log into the app UI. Use it once to create the real admin.

### 4.2 Create the application admin via the API
`POST /users` creates the user in *both* Keycloak and the database — that is the
account you log in with. Authenticate as the bootstrap admin, then create it:

```sh
# 1) get an access token for the bootstrap admin
TOKEN=$(curl -s -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<bootstrap-admin>","password":"<bootstrap-password>"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")

# 2) create the real admin user (exists in Keycloak + the app DB)
curl -s -X POST http://localhost:8081/users \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"username":"<admin-username>","email":"<admin-email>","firstName":"<first>",
       "lastName":"<last>","phoneNumber":"<phone>","password":"<admin-password>",
       "role":"ADMIN"}'
```

Log in to the frontend with this user.

## 5. Access the app

| Service | URL |
|---|---|
| Frontend | <http://localhost:8100> |
| API gateway | <http://localhost:8081> |
| Keycloak | <http://localhost:8080> |
| Grafana | <http://localhost:3000> |
| Prometheus | <http://localhost:9090> |
| Zipkin | <http://localhost:9411> |

Log in to the frontend with the admin user created in step 4.

## 6. Stop the stack

```sh
docker compose down            # stop, keep data (volumes)
docker compose down -v         # stop and wipe all data (Postgres/MySQL etc.)
```

# API documentation

**Auth legend**
- `public` — no token required
- `USER` — JWT Bearer token, USER role (or higher, via role hierarchy)
- `MANAGER` — JWT Bearer token, MANAGER role (or higher)
- `ADMIN` — JWT Bearer token, ADMIN role
- `owner/manager` — gateway requires the listed role, but a `@PreAuthorize` check then narrows access further to an owner/manager check
- `relationship` — gateway requires the listed role, but a`@PreAuthorize` check then narrows access further to specific relationships

**Role hierarchy:** `ADMIN > MANAGER > USER` — admins inherit manager and user permissions; managers inherit user permissions.

## Auth — `/auth`
 
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | public | Log in via Keycloak, returns access/refresh tokens |
| POST | `/auth/refresh` | public | Refresh an access token using a refresh token |
| POST | `/auth/logout` | authenticated | Log out, invalidating the access and refresh tokens |

## Users — `/users`
 
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users` | ADMIN | List all users (filter by `role`) |
| GET | `/users/me` | USER | Get the authenticated user's profile |
| GET | `/users/{userId}/projects/manager` | USER + owner/manager | List projects the user manages |
| GET | `/users/{userId}/projects/assignee` | USER + owner/manager | List projects the user is assigned to |
| GET | `/users/{userId}/organizations/manager` | USER + owner/manager | List organizations the user manages |
| GET | `/users/{userId}/organizations/member` | USER + owner/manager | List organizations the user belongs to |
| GET | `/users/{userId}/teams/manager` | USER + owner/manager | List teams the user manages |
| GET | `/users/{userId}/teams/assignee` | USER + owner/manager | List teams the user belongs to |
| GET | `/users/{userId}/work-items/reporter` | USER + owner/manager | List work items the user reported |
| GET | `/users/{userId}/work-items/assignee` | USER + owner/manager | List work items assigned to the user |
| POST | `/users` | ADMIN | Create a user |
| PUT | `/users/{userId}` | USER + self | Update a user's profile |
| DELETE | `/users/{userId}` | ADMIN | Delete a user |

## Organizations — `/organizations`
 
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/organizations` | ADMIN | List all organizations |
| GET | `/organizations/{organizationId}` | MANAGER + owner/member | Get an organization by ID |
| GET | `/organizations/{organizationId}/teams` | MANAGER + owner | List teams in an organization |
| GET | `/organizations/{organizationId}/users` | MANAGER + owner/member | List users in an organization (filter by `role`) |
| GET | `/organizations/{organizationId}/projects` | MANAGER + owner | List projects in an organization |
| GET | `/organizations/{organizationId}/work-items` | MANAGER + owner | List work items in an organization |
| POST | `/organizations` | ADMIN | Create an organization |
| PUT | `/organizations/{organizationId}` | ADMIN | Update an organization |
| DELETE | `/organizations/{organizationId}` | ADMIN | Delete an organization |

## Projects — `/projects`
 
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/projects` | ADMIN | List all projects |
| GET | `/projects/{projectId}` | USER + relationship | Get a project summary by ID |
| GET | `/projects/{projectId}/work-items` | USER + relationship | List work items in a project |
| GET | `/projects/{projectId}/teams` | USER + relationship | List teams in a project |
| GET | `/projects/{projectId}/members` | USER + relationship | List members of a project |
| POST | `/projects` | MANAGER | Create a project |
| PUT | `/projects/{projectId}` | MANAGER + relationship | Update a project |
| DELETE | `/projects/{projectId}` | MANAGER + relationship | Delete a project |

## Teams — `/teams`
 
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/teams` | ADMIN | List all teams |
| POST | `/teams` | MANAGER | Create a team |
| PUT | `/teams/{teamId}` | MANAGER + relationship | Update a team |
| DELETE | `/teams/{teamId}` | MANAGER + relationship | Delete a team |

## Work Items — `/work-items`
 
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/work-items` | ADMIN | List all work items (filter by `itemType`, `status`, `severity`) |
| GET | `/work-items/{workItemId}` | USER + relationship | Get a work item by ID |
| GET | `/work-items/{workItemId}/comments` | USER + relationship | List comments on a work item |
| POST | `/work-items` | USER + restricted | Create a work item |
| PUT | `/work-items/{workItemId}` | USER + relationship | Update a work item |
| PUT | `/work-items/{childId}/parent/{parentId}` | USER + relationship | Set a work item's parent |
| PUT | `/work-items/{childId}/parent` | USER + relationship | Remove a work item's parent |
| DELETE | `/work-items/{workItemId}` | MANAGER + relationship | Delete a work item |

## Comments — `/comments`
 
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/comments` | ADMIN | List all comments |
| POST | `/comments` | USER | Create a comment |
| PUT | `/comments/{commentId}` | USER + relationship | Update a comment |
| DELETE | `/comments/{commentId}` | USER + relationship | Delete a comment |

# Screenshots

## Admin menu
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/admin_menu.png)

## Admin dashboard
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/admin_dashboard.png)

## Select organization page
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/select_org.png)

## Organization dashboard
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/org_dashboard.png)

## Users page
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/users.png)

## Projects page
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/projects.png)

## Teams page
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/teams.png)

## Project dashboard
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/project_dashboard.png)

## Work items page
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/work_items.png)

## Work item page
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/work_item.png)

## Kanban board
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/kanban.png)

## Admin organizations page (dark mode)
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/admin_organizations_dark.png)

## Admin comments page (dark mode)
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/admin_comments_dark.png)

# AI agents help during development

## Github copilot
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/copilot_1.png)

![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/copilot_2.png)

## Claude
![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/claude_1.png)

![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/claude_2.png)

![Please contact a contributor of this project!](https://github.com/Giulian617/FlowManager/blob/main/docs/claude_3.png)

# Contributii
## Buzatu Giulian
- Nomenclator CRUD (user, comments, project, team)
- Unit tests (user, comments)
- API Gateway
- Integration and end to end tests
- Logging and monitoring
- Frontend (connection between frontend and backend and admin panel)
- Docker configuration

## Maican Adina Gabriela
- Nomenclator CRUD (work item, organization)
- Unit tests (work item, organization, project, team)
- Frontend (design of most pages)