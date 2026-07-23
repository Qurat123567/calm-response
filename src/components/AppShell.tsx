import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <span className="inline-block h-6 w-6 rounded-md bg-primary/15 ring-1 ring-primary/30" aria-hidden />
          Aftermath
        </Link>
        <Link
          to="/panic"
          className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          <ShieldAlert className="h-4 w-4" />
          Panic Mode
        </Link>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">{children}</main>
    </div>
  );
}
