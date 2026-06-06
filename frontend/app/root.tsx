import { isRouteErrorResponse, Links, Meta, Scripts, ScrollRestoration, Outlet, useNavigate } from "react-router"
import type { Route } from "./+types/root"
import { ThemeProvider } from "./context/ThemeContext"
import "./app.css"

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  )
}

const CLIENT_ERRORS: Record<number, { title: string; description: string }> = {
  400: { title: "Bad Request",          description: "The request was invalid or malformed." },
  401: { title: "Unauthorized",         description: "You need to log in to access this page." },
  403: { title: "Access Denied",        description: "You don't have permission to access this page." },
  404: { title: "Page Not Found",       description: "The page you're looking for doesn't exist or has been moved." },
  408: { title: "Request Timeout",      description: "The server timed out waiting for the request." },
  409: { title: "Conflict",             description: "The request could not be completed due to a conflict." },
  410: { title: "Gone",                 description: "The requested resource has been permanently removed." },
  422: { title: "Unprocessable Entity", description: "The request was well-formed but contains invalid data." },
  429: { title: "Too Many Requests",    description: "You've made too many requests. Please slow down." },
}

const SERVER_ERRORS: Record<number, { title: string; description: string }> = {
  500: { title: "Server Error",        description: "Something went wrong on our end. Please try again later." },
  502: { title: "Bad Gateway",         description: "The server received an invalid response from an upstream server." },
  503: { title: "Service Unavailable", description: "The service is temporarily unavailable. Please try again later." },
  504: { title: "Gateway Timeout",     description: "The upstream server failed to respond in time." },
}

function ClientErrorPage({ status, title, description }: { status: number; title: string; description: string }) {
  const navigate = useNavigate()
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center text-center gap-4 max-w-md">
        <div className="flex items-center justify-center h-24 w-24 rounded-3xl bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">{status}</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-slate-200"
        >
          Go back
        </button>
      </div>
    </main>
  )
}

function ServerErrorPage({ status, title, description, stack }: { status: number; title: string; description: string; stack?: string }) {
  const navigate = useNavigate()
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center text-center gap-4 max-w-md">
        <div className="flex items-center justify-center h-24 w-24 rounded-3xl bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
          <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">{status}</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        {import.meta.env.DEV && stack && (
          <pre className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-left text-xs text-slate-500 dark:text-slate-400 overflow-x-auto">
            {stack}
          </pre>
        )}
        <button
          onClick={() => navigate(-1)}
          className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-slate-200"
        >
          Go back
        </button>
      </div>
    </main>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = 500
  let message = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    status = error.status
    message = error.statusText || message
  } else if (error instanceof Error) {
    message = error.message
    stack = error.stack
  }

  if (status >= 400 && status < 500) {
    const page = CLIENT_ERRORS[status] ?? { title: "Client Error", description: message }
    return <ClientErrorPage status={status} title={page.title} description={page.description} />
  }

  const page = SERVER_ERRORS[status] ?? { title: "Unexpected Error", description: message }
  return <ServerErrorPage status={status} title={page.title} description={page.description} stack={stack} />
}