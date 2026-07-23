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

const KEY = "aftermath.inventory.v1";
const INCIDENT_KEY = "aftermath.currentIncident.v1";
const PROGRESS_PREFIX = "aftermath.progress.";

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

export function loadInventory(): Inventory | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Inventory;
  } catch {
    return null;
  }
}

export function saveInventory(inv: Inventory) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(inv));
}

export function hasCompletedInventory(): boolean {
  const inv = loadInventory();
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

export function saveProgress(id: IncidentType, checked: boolean[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_PREFIX + id, JSON.stringify(checked));
}

export function loadProgress(id: IncidentType): boolean[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROGRESS_PREFIX + id);
    return raw ? (JSON.parse(raw) as boolean[]) : null;
  } catch {
    return null;
  }
}

export type PlanStep = { text: string; detail?: string };
export type PlanMessage = { title: string; body: string };
export type Plan = { steps: PlanStep[]; messages: PlanMessage[] };

export function getSamplePlan(id: IncidentType): Plan {
  const base: Record<IncidentType, Plan> = {
    "phone-stolen": {
      steps: [
        { text: "Use Find My / Find My Device to locate or mark the phone as lost." },
        { text: "Remotely sign out of your Apple ID / Google account on that device." },
        { text: "Call your carrier and suspend the SIM." },
        { text: "Change passwords for email, banking, and social apps." },
        { text: "Enable 2FA on critical accounts from a trusted device." },
        { text: "File a police report if stolen — you'll need it for insurance." },
      ],
      messages: [
        { title: "Message to your bank", body: "Hi, my phone was stolen on [date]. Please flag my account for unusual activity and require additional verification on any transaction over [amount] until further notice." },
        { title: "Message to your carrier", body: "Hello, my phone was stolen/lost. Please suspend service and SIM on line [phone number] immediately. I'll need a replacement SIM as soon as possible." },
        { title: "Message to close contacts", body: "Heads up — my phone was stolen. If you get odd messages from my number, ignore them. Best way to reach me right now is [email / alt number]." },
      ],
    },
    "laptop-stolen": {
      steps: [
        { text: "Sign out of all sessions in Google, Apple, Microsoft accounts." },
        { text: "Revoke browser sessions and change your primary email password." },
        { text: "Rotate passwords for banking, cloud storage, and work tools." },
        { text: "Notify your bank; freeze cards saved in the browser if needed." },
        { text: "Enable Find My / Locate on the device; wipe remotely if possible." },
        { text: "File a police report and notify your employer or clients." },
      ],
      messages: [
        { title: "Message to your employer / client", body: "Hi — my laptop was stolen on [date]. I've already rotated passwords for [tools]. I'll be working from a backup device while I sort a replacement. No client data was stored locally / [describe what was]." },
        { title: "Message to your bank", body: "Hi, my laptop was stolen. Please flag my account and require extra verification on any online transaction until I confirm otherwise." },
        { title: "Message to close contacts", body: "Heads up: my laptop was stolen. If anyone messages you pretending to be me asking for money or logins, it isn't me." },
      ],
    },
    "email-hacked": {
      steps: [
        { text: "From a trusted device, change your email password to something new and long." },
        { text: "Sign out all other sessions in your account security page." },
        { text: "Turn on 2FA and remove any unfamiliar recovery methods." },
        { text: "Check filters and forwarding rules — attackers hide there." },
        { text: "Reset passwords on any account linked to that email." },
        { text: "Notify contacts if scam messages went out from your address." },
      ],
      messages: [
        { title: "Message to your contacts", body: "Hi — my email was hacked earlier today. If you got anything odd from me (money requests, weird links), please ignore and delete it. I've secured the account now." },
        { title: "Message to your bank", body: "Hi, my email account was compromised. Please flag my account for extra verification on password resets and transactions until I confirm otherwise." },
        { title: "Message to your email provider support", body: "Hello, my account was accessed by someone else on [date/time approx]. I've regained access and changed the password. Please review recent activity and confirm no forwarding rules or recovery info remain that I didn't set." },
      ],
    },
    "social-hacked": {
      steps: [
        { text: "Use the platform's 'my account was hacked' recovery flow." },
        { text: "Change the linked email password first, then the social password." },
        { text: "Turn on 2FA and remove unknown devices from active sessions." },
        { text: "Report impersonation posts and DMs from your account." },
        { text: "Post a note (from another account) warning followers." },
        { text: "Review connected apps and revoke anything unfamiliar." },
      ],
      messages: [
        { title: "Message to your followers", body: "Quick heads up: my [platform] was hacked. If you got a DM from me about crypto / gift cards / anything financial in the last 24 hours, it wasn't me. Recovering the account now." },
        { title: "Message to platform support", body: "Hi, my account @[handle] was compromised on [date]. I no longer have access / I've regained access. Please review recent posts and DMs and remove anything the attacker sent." },
        { title: "Message to close contacts", body: "My [platform] got hacked. Ignore anything weird from that account. Reach me on [alt channel] instead for now." },
      ],
    },
    "client-scam": {
      steps: [
        { text: "Gather every message, invoice, and file exchange in one folder." },
        { text: "Send a firm but professional final payment reminder with a deadline." },
        { text: "Revoke access to any files, drives, or tools you still control." },
        { text: "If you used a freelance platform, open a formal dispute." },
        { text: "Consider a small-claims filing or a collections service for larger amounts." },
        { text: "Write a short internal note on what you'll change in future contracts." },
      ],
      messages: [
        { title: "Final payment reminder", body: "Hi [name], following up on invoice [#] for [amount], now [X] days overdue. Please confirm payment by [date]. After that I'll need to pause access to the delivered work and escalate through [platform / small claims]." },
        { title: "Platform dispute message", body: "Hi support, I'm opening a dispute on contract [ID]. Work was delivered on [date] per the agreed scope. Client has not responded to [N] payment requests. Attaching messages and deliverables." },
        { title: "Message to the client (firm, professional)", body: "Hi [name], I haven't heard back on invoice [#]. I want to resolve this directly rather than escalate. Please reply by [date] with a payment date or a reason for the delay." },
      ],
    },
  };
  return base[id];
}
