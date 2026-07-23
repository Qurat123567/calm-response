import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { INCIDENTS, setCurrentIncident, type IncidentType } from "@/lib/aftermath-store";

export const Route = createFileRoute("/incidents")({
  head: () => ({
    meta: [
      { title: "What happened? — Aftermath" },
      {
        name: "description",
        content: "Pick what's going on and Aftermath will walk you through the next steps.",
      },
      { property: "og:title", content: "What happened? — Aftermath" },
      {
        property: "og:description",
        content: "Choose your incident type to get a calm, ordered recovery plan.",
      },
    ],
  }),
  component: IncidentsPage,
});

function IncidentsPage() {
  const navigate = useNavigate();

  const pick = (id: IncidentType) => {
    setCurrentIncident(id);
    if (id === "other") {
      navigate({ to: "/describe" });
      return;
    }
    navigate({ to: "/plan/$type", params: { type: id } });
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">What happened?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick the closest one. You can change it later — nothing is permanent here.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {INCIDENTS.map((i) => (
          <button
            key={i.id}
            onClick={() => pick(i.id)}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
              {i.emoji}
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">{i.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{i.blurb}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          to="/inventory"
          search={{ edit: true }}
          className="text-sm text-muted-foreground underline hover:text-foreground"
        >
          Edit my inventory
        </Link>
      </div>
    </AppShell>
  );
}
