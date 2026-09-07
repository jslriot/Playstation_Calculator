export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (req.headers.origin && req.headers.origin !== `https://${req.headers.host}`) return res.status(403).json({ error: "Origin not allowed" });
  const body = req.body || {};
  const required = ["consent_id", "occurred_at", "consent_version", "policy_version", "action"];
  for (const key of required) if (!body[key]) return res.status(400).json({ error: `Missing ${key}` });
  const allowedActions = new Set(["accept_optional", "necessary_only", "save_preferences", "withdraw"]);
  if (!allowedActions.has(body.action)) return res.status(400).json({ error: "Invalid action" });
  if (typeof body.consent_id !== "string" || !/^[a-f0-9-]{36}$/i.test(body.consent_id)) return res.status(400).json({ error: "Invalid consent_id" });
  if (typeof body.consent_version !== "string" || body.consent_version.length > 40) return res.status(400).json({ error: "Invalid consent_version" });
  if (typeof body.policy_version !== "string" || body.policy_version.length > 40) return res.status(400).json({ error: "Invalid policy_version" });
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return res.status(503).json({ error: "Consent storage is not configured" });
  const occurred = new Date(body.occurred_at);
  if (Number.isNaN(occurred.getTime())) return res.status(400).json({ error: "Invalid occurred_at" });
  const row = { consent_id: body.consent_id, occurred_at: occurred.toISOString(), action: body.action, necessary: body.necessary !== false, analytics: body.analytics === true, consent_version: body.consent_version, policy_version: body.policy_version, mechanism: typeof body.mechanism === "string" ? body.mechanism.slice(0, 80) : "web", page: typeof body.page === "string" ? body.page.slice(0, 500) : null };
  try {
    const response = await fetch(`${url}/rest/v1/consent_events`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(row) });
    if (!response.ok) { console.error("Consent persistence failed", response.status); return res.status(502).json({ error: "Consent storage failed" }); }
    return res.status(201).json({ ok: true });
  } catch (error) { console.error("Consent persistence error", error); return res.status(502).json({ error: "Consent storage failed" }); }
}