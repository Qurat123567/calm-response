import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  emptyInventory,
  loadInventory,
  saveInventory,
  type Inventory,
} from "@/lib/aftermath-store";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Your digital inventory — Aftermath" },
      {
        name: "description",
        content:
          "Tell Aftermath what apps, accounts, and platforms you use so it can tailor a recovery plan when things go wrong.",
      },
      { property: "og:title", content: "Your digital inventory — Aftermath" },
      {
        property: "og:description",
        content: "A quick, calm setup so your recovery plan fits your life.",
      },
    ],
  }),
  component: InventoryPage,
});

const BANK_OPTIONS = ["Revolut", "Wise", "PayPal", "Venmo", "Cash App", "Traditional bank app"];
const EMAIL_OPTIONS = ["Gmail", "Outlook / Hotmail", "iCloud Mail", "Proton Mail", "Yahoo", "Custom domain"];
const SOCIAL_OPTIONS = ["Instagram", "WhatsApp", "Twitter / X", "LinkedIn", "Facebook", "TikTok"];
const CLOUD_OPTIONS = ["Google Drive", "iCloud", "Dropbox", "OneDrive", "Notion"];
const FREELANCE_OPTIONS = ["Upwork", "Fiverr", "Direct clients", "Contra", "Toptal", "None"];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function InventoryPage() {
  const [inv, setInv] = useState<Inventory>(emptyInventory);
  const navigate = useNavigate();

  useEffect(() => {
    loadInventory().then((existing) => {
      if (existing) setInv(existing);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveInventory({ ...inv, completed: true });
    navigate({ to: "/incidents" });
  };


  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Your digital inventory
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Not passwords — just what you use. This helps Aftermath give you the right steps if
          something ever goes wrong.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Section title="Bank & payment apps" hint="Which do you actively use?">
          <div className="flex flex-wrap gap-2">
            {BANK_OPTIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                active={inv.bankApps.includes(o)}
                onClick={() => setInv({ ...inv, bankApps: toggle(inv.bankApps, o) })}
              />
            ))}
          </div>
        </Section>

        <Section title="Email providers" hint="Personal and work.">
          <div className="flex flex-wrap gap-2">
            {EMAIL_OPTIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                active={inv.emailProviders.includes(o)}
                onClick={() =>
                  setInv({ ...inv, emailProviders: toggle(inv.emailProviders, o) })
                }
              />
            ))}
          </div>
        </Section>

        <Section title="Phone">
          <div className="flex flex-wrap gap-2">
            {(["iOS", "Android", "Other"] as const).map((o) => (
              <Chip
                key={o}
                label={o}
                active={inv.phoneOS === o}
                onClick={() => setInv({ ...inv, phoneOS: inv.phoneOS === o ? "" : o })}
              />
            ))}
          </div>
        </Section>

        <Section title="Laptop">
          <div className="flex flex-wrap gap-2">
            {(["macOS", "Windows", "Linux", "Other"] as const).map((o) => (
              <Chip
                key={o}
                label={o}
                active={inv.laptopOS === o}
                onClick={() => setInv({ ...inv, laptopOS: inv.laptopOS === o ? "" : o })}
              />
            ))}
          </div>
        </Section>

        <Section title="Social accounts">
          <div className="flex flex-wrap gap-2">
            {SOCIAL_OPTIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                active={inv.socialAccounts.includes(o)}
                onClick={() =>
                  setInv({ ...inv, socialAccounts: toggle(inv.socialAccounts, o) })
                }
              />
            ))}
          </div>
        </Section>

        <Section title="Cloud storage">
          <div className="flex flex-wrap gap-2">
            {CLOUD_OPTIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                active={inv.cloudStorage.includes(o)}
                onClick={() =>
                  setInv({ ...inv, cloudStorage: toggle(inv.cloudStorage, o) })
                }
              />
            ))}
          </div>
        </Section>

        <Section title="Freelance platforms" hint="If any.">
          <div className="flex flex-wrap gap-2">
            {FREELANCE_OPTIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                active={inv.freelancePlatforms.includes(o)}
                onClick={() =>
                  setInv({
                    ...inv,
                    freelancePlatforms: toggle(inv.freelancePlatforms, o),
                  })
                }
              />
            ))}
          </div>
        </Section>

        <div className="sticky bottom-4 pt-2">
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
          >
            Save & continue
          </button>
        </div>
      </form>
    </AppShell>
  );
}
