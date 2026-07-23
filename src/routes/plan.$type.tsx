import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Loader2, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  INCIDENTS,
  loadInventory,
  loadProgress,
  saveProgress,
  setCurrentIncident,
  type IncidentType,
} from "@/lib/aftermath-store";
import { generateActionPlan, type GroqPlan } from "@/lib/groq-plan.functions";

const VALID: IncidentType[] = INCIDENTS.map((i) => i.id);

export const Route = createFileRoute("/plan/$type")({
  head: () => ({
    meta: [
      { title: "Your action plan — Aftermath" },
      {
        name: "description",
        content: "A step-by-step recovery checklist and ready-to-send messages for your situation.",
      },
      { property: "og:title", content: "Your action plan — Aftermath" },
      {
        property: "og:description",
        content: "Calm, ordered steps and pre-written messages you can copy right now.",
      },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const { type } = useParams({ from: "/plan/$type" });
  const isValid = VALID.includes(type as IncidentType);
  const incidentId = (isValid ? type : "phone-stolen") as IncidentType;
  const incident = INCIDENTS.find((i) => i.id === incidentId)!;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<GroqPlan | null>(null);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const inventory = loadInventory();
      const result = await generateActionPlan({
        data: {
          incidentType: incidentId,
          incidentTitle: incident.title,
          inventory: inventory as unknown as Record<string, unknown> | null,
        },
      });
      setPlan(result);
      const saved = loadProgress(incidentId);
      setChecked(
        saved && saved.length === result.steps.length
          ? saved
          : new Array(result.steps.length).fill(false),
      );
    } catch (err) {
      console.error(err);
      setError("We couldn't generate your plan just now. Take a breath and try again.");
    } finally {
      setLoading(false);
    }
  }, [incidentId, incident.title]);

  useEffect(() => {
    setCurrentIncident(incidentId);
    fetchPlan();
  }, [incidentId, fetchPlan]);

  const toggle = (i: number) => {
    const next = checked.map((v, idx) => (idx === i ? !v : v));
    setChecked(next);
    saveProgress(incidentId, next);
  };

  const copy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((c) => (c === idx ? null : c)), 1500);
    } catch {
      /* noop */
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-base font-medium text-foreground">Generating your plan…</p>
          <p className="mt-1 text-sm text-muted-foreground">Take a breath. This will be quick.</p>
        </div>
      </AppShell>
    );
  }

  if (error || !plan) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <h1 className="text-xl font-semibold text-foreground">Something got in the way</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {error ?? "We couldn't generate your plan just now."}
          </p>
          <button
            onClick={fetchPlan}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <Link
            to="/incidents"
            className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Pick a different situation
          </Link>
        </div>
      </AppShell>
    );
  }

  const done = checked.filter(Boolean).length;
  const total = plan.steps.length;

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Your plan</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {incident.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {done}/{total} steps done
          </p>
        </div>
        <Link
          to="/incidents"
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent"
        >
          Change
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold">Do these in order</h2>
        <ol className="mt-3 space-y-2">
          {plan.steps.map((s, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors hover:bg-accent/40">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 accent-primary"
                  checked={checked[i] ?? false}
                  onChange={() => toggle(i)}
                />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-primary">{i + 1}.</span>
                    <span
                      className={`text-sm sm:text-base ${
                        checked[i] ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {s.action}
                    </span>
                  </div>
                  {s.reason && (
                    <p className="mt-1 pl-6 text-sm text-muted-foreground">Why: {s.reason}</p>
                  )}
                </div>
              </label>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Ready to send</h2>
        <div className="space-y-3">
          {plan.messages.map((m, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">{m.title}</h3>
                <button
                  onClick={() => copy(m.body, i)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                >
                  {copiedIdx === i ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-primary" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {m.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
