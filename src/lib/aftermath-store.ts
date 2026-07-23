import { supabase } from "@/integrations/supabase/client";

export type IncidentType =
  | "phone-stolen"
  | "laptop-stolen"
  | "email-hacked"
  | "social-hacked"
  | "client-scam";

export const INCIDENTS: { id: IncidentType; title: string; blurb: string; emoji: string }[] = [
  { id: "phone-stolen", title: "Phone Stolen or Lost", blurb: "Lock it, wipe it, protect your accounts.", emoji: "📱" },
  { id: "laptop-stolen", title: "Laptop Stolen or Dead", blurb: "Secure logins and recover work.", emoji: "💻" },
  { id: "email-hacked", title: "Email Compromised / Hacked", blurb: "Kick out intruders, restore control.", emoji: "✉️" },
  { id: "social-hacked", title: "Social Account Hacked", blurb: "Report, recover, notify your circle.", emoji: "🧑‍💻" },
  { id: "client-scam", title: "Client Scam / Non-Payment / Ghosted", blurb: "Document, escalate, protect your work.", emoji: "🧾" },
];

export type Inventory = {
  bankApps: string[];
  emailProviders: string[];
  phoneOS: "iOS" | "Android" | "Other" | "";
  laptopOS: "macOS" | "Windows" | "Linux" | "Other" | "";
  socialAccounts: string[];
  cloudStorage: string[];
  freelancePlatforms: string[];
  completed: boolean;
};

const DEVICE_KEY = "aftermath.deviceId.v1";
const INCIDENT_KEY = "aftermath.currentIncident.v1";

export const emptyInventory = (): Inventory => ({
  bankApps: [],
  emailProviders: [],
  phoneOS: "",
  laptopOS: "",
  socialAccounts: [],
  cloudStorage: [],
  freelancePlatforms: [],
  completed: false,
});

function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export async function loadInventory(): Promise<Inventory | null> {
  if (typeof window === "undefined") return null;
  const deviceId = getDeviceId();
  const { data, error } = await supabase
    .from("device_inventories")
    .select("inventory")
    .eq("device_id", deviceId)
    .maybeSingle();
  if (error || !data) return null;
  return data.inventory as Inventory;
}

export async function saveInventory(inv: Inventory): Promise<void> {
  if (typeof window === "undefined") return;
  const deviceId = getDeviceId();
  await supabase
    .from("device_inventories")
    .upsert(
      { device_id: deviceId, inventory: inv as never, updated_at: new Date().toISOString() },
      { onConflict: "device_id" },
    );
}


export async function hasCompletedInventory(): Promise<boolean> {
  const inv = await loadInventory();
  return !!inv?.completed;
}

export function setCurrentIncident(id: IncidentType) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INCIDENT_KEY, id);
}

export function getCurrentIncident(): IncidentType | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(INCIDENT_KEY) as IncidentType | null) ?? null;
}

export async function saveProgress(id: IncidentType, checked: boolean[]): Promise<void> {
  if (typeof window === "undefined") return;
  const deviceId = getDeviceId();
  await supabase
    .from("device_progress")
    .upsert(
      { device_id: deviceId, incident_type: id, checked: checked as never, updated_at: new Date().toISOString() },
      { onConflict: "device_id,incident_type" },
    );
}


export async function loadProgress(id: IncidentType): Promise<boolean[] | null> {
  if (typeof window === "undefined") return null;
  const deviceId = getDeviceId();
  const { data, error } = await supabase
    .from("device_progress")
    .select("checked")
    .eq("device_id", deviceId)
    .eq("incident_type", id)
    .maybeSingle();
  if (error || !data) return null;
  return data.checked as boolean[];
}

export type PlanStep = { action: string; reason?: string };
export type PlanMessage = { title: string; body: string };
export type Plan = { steps: PlanStep[]; messages: PlanMessage[] };

export async function savePlan(id: IncidentType, plan: Plan): Promise<void> {
  if (typeof window === "undefined") return;
  const deviceId = getDeviceId();
  await supabase
    .from("device_plans")
    .upsert(
      { device_id: deviceId, incident_type: id, plan: plan as never, updated_at: new Date().toISOString() },
      { onConflict: "device_id,incident_type" },
    );
}

export async function loadPlan(id: IncidentType): Promise<Plan | null> {
  if (typeof window === "undefined") return null;
  const deviceId = getDeviceId();
  const { data, error } = await supabase
    .from("device_plans")
    .select("plan")
    .eq("device_id", deviceId)
    .eq("incident_type", id)
    .maybeSingle();
  if (error || !data) return null;
  return data.plan as Plan;
}

