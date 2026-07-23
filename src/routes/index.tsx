import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { hasCompletedInventory } from "@/lib/aftermath-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aftermath — Breathe. Then act." },
      {
        name: "description",
        content:
          "A calm, guided response plan for when things go wrong online: stolen phones, hacked accounts, non-paying clients.",
      },
      { property: "og:title", content: "Aftermath — Breathe. Then act." },
      {
        property: "og:description",
        content: "Guided, calming recovery steps for digital emergencies.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [returning, setReturning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setReturning(hasCompletedInventory());
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-xl py-6 text-center sm:py-12">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
          <span className="text-2xl">🌿</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Aftermath
        </h1>
        <p className="mt-3 text-lg font-medium text-primary">Breathe. Then act.</p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          When something goes wrong online — a stolen phone, a hacked account, a client who
          vanished — Aftermath gives you a clear, calm plan of what to do next, step by step.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          {returning ? (
            <button
              onClick={() => navigate({ to: "/incidents" })}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Something happened — help me now
            </button>
          ) : (
            <Link
              to="/inventory"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Set up my digital inventory
            </Link>
          )}
          {returning && (
            <Link
              to="/inventory"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
            >
              Update my inventory
            </Link>
          )}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Setup takes about 2 minutes. Nothing sensitive — no passwords, just what you use.
        </p>
      </div>
    </AppShell>
  );
}
