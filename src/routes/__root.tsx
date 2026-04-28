import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lumen — Smart Study Planner" },
      {
        name: "description",
        content: "A calm, smart study planner with prioritized tasks, Pomodoro focus, and weekly insights.",
      },
      { name: "author", content: "Lumen" },
      { property: "og:title", content: "Lumen — Smart Study Planner" },
      {
        property: "og:description",
        content: "Plan, focus, and track your study sessions with a beautifully calm interface.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lumen — Smart Study Planner" },
      { name: "description", content: "Smart Study Hub is a web application designed to help users organize their academic tasks and learning materials." },
      { property: "og:description", content: "Smart Study Hub is a web application designed to help users organize their academic tasks and learning materials." },
      { name: "twitter:description", content: "Smart Study Hub is a web application designed to help users organize their academic tasks and learning materials." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8163f8e3-4416-4197-9982-e08db4224194/id-preview-cdf13395--34b90d53-4683-412f-bfd0-74785323c2e6.lovable.app-1777362468232.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8163f8e3-4416-4197-9982-e08db4224194/id-preview-cdf13395--34b90d53-4683-412f-bfd0-74785323c2e6.lovable.app-1777362468232.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
