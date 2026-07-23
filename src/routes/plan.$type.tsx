import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  getSamplePlan,
  INCIDENTS,
  loadProgress,
  saveProgress,
  setCurrentIncident,
  type IncidentType,
} from "@/lib/aftermath-store";

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
  const [plan, setPlan] = useState(() => getSamplePlan(incidentId));
  const [checked, setChecked] = useState<boolean[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    setCurrentIncident(incidentId);
    setLoading(true);
    const p = getSamplePlan(incidentId);
    setPlan(p);
    const saved = loadProgress(incidentId);
    setChecked(saved && saved.length === p.steps.length ? saved : new Array(p.steps.length).fill(false));
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, [incidentId]);

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

  const done = checked.filter(Boolean).length;
  const total = plan.steps.length;

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
                      {s.text}
                    </span>
                  </div>
                  {s.detail && (
                    <p className="mt-1 pl-6 text-sm text-muted-foreground">{s.detail}</p>
                  )}
                </div>
              </label>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-base font-semibold">Pre-written messages</h2>
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

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Sample plan for now. A tailored AI version will replace this soon.
      </p>
    </AppShell>
  );
}
