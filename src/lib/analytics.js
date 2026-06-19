// Client for the Cloudflare Worker analytics endpoint (see worker/README.md).
//
// After deploying the Worker, paste its URL below (replace YOUR-SUBDOMAIN) or
// set VITE_ANALYTICS_URL at build time. Until then the Analytics tab shows a
// "not configured" message instead of erroring.
const ENDPOINT =
  import.meta.env.VITE_ANALYTICS_URL ||
  "https://morganfung-analytics.morganfung2004.workers.dev";

export const isConfigured = !ENDPOINT.includes("YOUR-SUBDOMAIN");

async function call(method) {
  const res = await fetch(ENDPOINT, { method });
  if (!res.ok) throw new Error(`Analytics ${res.status}`);
  return res.json();
}

// POST records this visit (deduped server-side by hashed IP) and returns stats.
// Memoized for the lifetime of the page load, so a visit is recorded at most
// once even though both the Layout and the Analytics page call it.
let visitPromise = null;
export function loadAnalytics() {
  if (!isConfigured) return Promise.reject(new Error("not configured"));
  if (!visitPromise) visitPromise = call("POST");
  return visitPromise;
}

// GET returns fresh stats without recording a new visit.
export function refreshAnalytics() {
  if (!isConfigured) return Promise.reject(new Error("not configured"));
  return call("GET");
}
