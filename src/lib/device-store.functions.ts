import { createServerFn } from "@tanstack/react-start";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertDeviceId(id: unknown): string {
  if (typeof id !== "string" || !UUID_RE.test(id)) {
    throw new Error("Invalid device id");
  }
  return id;
}

function assertIncidentType(t: unknown): string {
  if (typeof t !== "string" || t.length === 0 || t.length > 64) {
    throw new Error("Invalid incident type");
  }
  return t;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/* ---------- inventory ---------- */

export const getInventory = createServerFn({ method: "POST" })
  .inputValidator((input: { deviceId: string }) => ({ deviceId: assertDeviceId(input.deviceId) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row, error } = await db
      .from("device_inventories")
      .select("inventory")
      .eq("device_id", data.deviceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row?.inventory as unknown) ?? null;
  });

export const saveInventory = createServerFn({ method: "POST" })
  .inputValidator((input: { deviceId: string; inventory: unknown }) => ({
    deviceId: assertDeviceId(input.deviceId),
    inventory: input.inventory,
  }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("device_inventories").upsert(
      {
        device_id: data.deviceId,
        inventory: data.inventory as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "device_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- progress ---------- */

export const getProgress = createServerFn({ method: "POST" })
  .inputValidator((input: { deviceId: string; incidentType: string }) => ({
    deviceId: assertDeviceId(input.deviceId),
    incidentType: assertIncidentType(input.incidentType),
  }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row, error } = await db
      .from("device_progress")
      .select("checked")
      .eq("device_id", data.deviceId)
      .eq("incident_type", data.incidentType)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row?.checked as boolean[] | null) ?? null;
  });

export const saveProgress = createServerFn({ method: "POST" })
  .inputValidator((input: { deviceId: string; incidentType: string; checked: boolean[] }) => ({
    deviceId: assertDeviceId(input.deviceId),
    incidentType: assertIncidentType(input.incidentType),
    checked: Array.isArray(input.checked) ? input.checked.map((v) => Boolean(v)) : [],
  }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("device_progress").upsert(
      {
        device_id: data.deviceId,
        incident_type: data.incidentType,
        checked: data.checked as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "device_id,incident_type" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- plan ---------- */

export const getPlan = createServerFn({ method: "POST" })
  .inputValidator((input: { deviceId: string; incidentType: string }) => ({
    deviceId: assertDeviceId(input.deviceId),
    incidentType: assertIncidentType(input.incidentType),
  }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row, error } = await db
      .from("device_plans")
      .select("plan")
      .eq("device_id", data.deviceId)
      .eq("incident_type", data.incidentType)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row?.plan as unknown) ?? null;
  });

export const savePlan = createServerFn({ method: "POST" })
  .inputValidator((input: { deviceId: string; incidentType: string; plan: unknown }) => ({
    deviceId: assertDeviceId(input.deviceId),
    incidentType: assertIncidentType(input.incidentType),
    plan: input.plan,
  }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("device_plans").upsert(
      {
        device_id: data.deviceId,
        incident_type: data.incidentType,
        plan: data.plan as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "device_id,incident_type" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
