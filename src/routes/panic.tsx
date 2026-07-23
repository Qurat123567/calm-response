import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  getCurrentIncident,
  INCIDENTS,
  loadPlan,
  loadProgress,
  type IncidentType,
  type Plan,
} from "@/lib/aftermath-store";

export const Route = createFileRoute("/panic")({
  head: () => ({
    meta: [
      { title: "Panic Mode — Aftermath" },
      {
        name: "description",
        content: "A stripped-down view of your recovery progress and messages, for when you're stressed.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Panic Mode — Aftermath" },
      { property: "og:description", content: "Only what you need, right now." },
    ],
  }),
  component: PanicPage,
});

function PanicPage() {
  const navigate = useNavigate();
  const [incidentId, setIncidentId] = useState<IncidentType | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMsg, setOpenMsg] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const id = getCurrentIncident();
    setIncidentId(id);
    if (!id) {
      setLoading(false);
      return;
    }
    const [p, prog] = await Promise.all([loadPlan(id), loadProgress(id)]);
    setPlan(p);
    if (p) {
      setChecked(
        prog && prog.length === p.steps.length
          ? prog
          : new Array(p.steps.length).fill(false),
      );
    } else {
      setChecked(prog ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="mt-4 text-lg text-neutral-300">Loading your plan…</p>
        </div>
      </div>
    );
  }

  if (!incidentId) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <h1 className="text-3xl font-bold">Panic Mode</h1>
          <p className="mt-3 text-lg text-neutral-300">
            Pick what happened first, then this screen shows only what you need.
          </p>
          <button
            onClick={() => navigate({ to: "/incidents" })}
            className="mt-8 w-full rounded-2xl bg-white px-6 py-4 text-lg font-bold text-neutral-950"
          >
            Choose incident
          </button>
          <Link to="/" className="mt-4 text-sm text-neutral-400 underline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const incident = INCIDENTS.find((i) => i.id === incidentId)!;

  if (!plan) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Panic Mode
          </span>
          <h1 className="mt-6 text-2xl font-bold">{incident.title}</h1>
          <p className="mt-3 text-lg text-neutral-300">
            Your action plan hasn't been generated yet. Open it once, then this screen will
            stay in sync.
          </p>
          <button
            onClick={() => navigate({ to: "/plan/$type", params: { type: incidentId } })}
            className="mt-8 w-full rounded-2xl bg-white px-6 py-4 text-lg font-bold text-neutral-950"
          >
            Generate my plan
          </button>
          <Link to="/" className="mt-4 text-sm text-neutral-400 underline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const done = checked.filter(Boolean).length;
  const total = plan.steps.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (openMsg !== null) {
    const m = plan.messages[openMsg];
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto max-w-lg px-6 py-8">
          <button
            onClick={() => setOpenMsg(null)}
            className="inline-flex items-center gap-2 text-base text-neutral-300"
          >
            <ArrowLeft className="h-5 w-5" /> Back
          </button>
          <h2 className="mt-6 text-2xl font-bold">{m.title}</h2>
          <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-neutral-100">
            {m.body}
          </p>
          <button
            onClick={() => navigator.clipboard?.writeText(m.body)}
            className="mt-8 w-full rounded-2xl bg-white px-6 py-5 text-lg font-bold text-neutral-950"
          >
            Copy message
          </button>
        </div>
      </div>
    );
  }

  const nextStepIdx = checked.findIndex((c) => !c);
  const nextStep = nextStepIdx >= 0 ? plan.steps[nextStepIdx] : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-lg px-6 py-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm text-neutral-400 underline">
            Exit
          </Link>
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Panic Mode
          </span>
        </div>

        <h1 className="mt-8 text-3xl font-bold leading-tight">{incident.title}</h1>
        <p className="mt-2 text-lg text-neutral-300">Breathe. One step at a time.</p>

        <div className="mt-6 rounded-2xl bg-neutral-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">Progress</span>
            <span className="text-base font-bold">
              {done} / {total}
            </span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          {nextStep && (
            <div className="mt-4 rounded-xl bg-neutral-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Next step
              </p>
              <p className="mt-1 text-base font-semibold text-white">{nextStep.action}</p>
            </div>
          )}
          <Link
            to="/plan/$type"
            params={{ type: incidentId }}
            className="mt-4 block text-center text-sm text-neutral-300 underline"
          >
            Open full checklist
          </Link>
        </div>

        <h2 className="mt-8 text-xl font-bold">Your messages</h2>
        <div className="mt-3 space-y-3">
          {plan.messages.map((m, i) => (
            <button
              key={i}
              onClick={() => setOpenMsg(i)}
              className="w-full rounded-2xl bg-white px-5 py-5 text-left text-lg font-bold text-neutral-950 shadow-lg"
            >
              {m.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
