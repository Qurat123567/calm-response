import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  getCurrentIncident,
  getSamplePlan,
  INCIDENTS,
  loadProgress,
  type IncidentType,
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
  const [checked, setChecked] = useState<boolean[]>([]);
  const [openMsg, setOpenMsg] = useState<number | null>(null);

  useEffect(() => {
    const id = getCurrentIncident();
    setIncidentId(id);
    if (id) {
      const p = getSamplePlan(id);
      loadProgress(id).then((prog) => {
        setChecked(prog ?? new Array(p.steps.length).fill(false));
      });
    }
  }, []);


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
  const plan = getSamplePlan(incidentId);
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
