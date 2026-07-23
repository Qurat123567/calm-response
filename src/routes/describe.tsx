import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  getOtherDescription,
  setCurrentIncident,
  setOtherDescription,
} from "@/lib/aftermath-store";

export const Route = createFileRoute("/describe")({
  head: () => ({
    meta: [
      { title: "Describe what happened — Aftermath" },
      {
        name: "description",
        content:
          "Tell Aftermath what happened in your own words and get a calm, tailored action plan.",
      },
      { property: "og:title", content: "Describe what happened — Aftermath" },
      {
        property: "og:description",
        content: "A short description is enough — Aftermath handles the rest.",
      },
    ],
  }),
  component: DescribePage,
});

const MIN = 10;
const MAX = 600;

function DescribePage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  useEffect(() => {
    setCurrentIncident("other");
    setText(getOtherDescription());
  }, []);

  const trimmed = text.trim();
  const canContinue = trimmed.length >= MIN && trimmed.length <= MAX;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    setOtherDescription(trimmed);
    navigate({ to: "/plan/$type", params: { type: "other" } });
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Something else
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Tell me what happened
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A few sentences is enough. Aftermath will build a calm, ordered plan and
            ready-to-send messages tailored to your situation.
          </p>
        </div>
        <Link
          to="/incidents"
          className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent"
        >
          Back
        </Link>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <label
            htmlFor="describe"
            className="block text-sm font-semibold text-foreground"
          >
            What's going on?
          </label>
          <p className="mt-0.5 text-sm text-muted-foreground">
            You don't need to be technical. Plain words are best.
          </p>
          <textarea
            id="describe"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            rows={6}
            maxLength={MAX}
            placeholder="e.g. Someone I paid on a freelance site has vanished and my account there is now locked."
            className="mt-3 w-full resize-y rounded-xl border border-border bg-background p-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>
              {trimmed.length < MIN
                ? `Add ${MIN - trimmed.length} more character${MIN - trimmed.length === 1 ? "" : "s"}`
                : "Looks good"}
            </span>
            <span>
              {text.length}/{MAX}
            </span>
          </div>
        </div>

        <div className="sticky bottom-4 pt-2">
          <button
            type="submit"
            disabled={!canContinue}
            className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generate my plan
          </button>
        </div>
      </form>
    </AppShell>
  );
}
