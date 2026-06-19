// Cloudflare Worker — privacy-friendly visitor analytics backed by D1.
//
// Geolocation comes from Cloudflare's edge (request.cf), so there is no
// third-party IP-lookup API and nothing runs on the client. Visitor IPs are
// hashed with a secret salt and used only as a dedup key — the raw IP is never
// stored. Each unique IP = one row = one "unique visitor".
//
// Endpoints (single URL):
//   POST /   record this visit (deduped) and return stats
//   GET  /   return stats only, without recording (handy for refresh/testing)

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|whatsapp|telegram|discordbot|preview|monitor|headless|lighthouse|gtmetrix|pingdom|uptime|curl|wget|python-requests|axios|node-fetch/i;

function corsHeaders(origin, allowed) {
  const allow = allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (
      env.ALLOWED_ORIGINS ||
      "https://morganfung.com,https://www.morganfung.com"
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const cors = corsHeaders(origin, allowed);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: {
          ...cors,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });

    if (request.method !== "GET" && request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    try {
      const cf = request.cf || {};
      const city = String(cf.city || "Unknown");
      const region = String(cf.region || "");
      const country = String(cf.country || "XX");

      const ua = request.headers.get("User-Agent") || "";
      const isBot = !ua || BOT_RE.test(ua);
      // Only POST from a real browser writes to the database. GET is read-only.
      const record = request.method === "POST" && !isBot;

      // Identify the visitor on every request (GET and POST) so "last visitor"
      // can always exclude them. Only POST writes a row; GET stays read-only.
      const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
      const ipHash = await hashIp(ip, env.IP_SALT || "please-set-IP_SALT");

      // "Last visitor before you": newest row that isn't the current visitor.
      // Read this BEFORE the upsert so it reflects the prior state.
      const lastRow = await env.DB.prepare(
        `SELECT city, region, country, last_seen FROM visitors
         WHERE ip_hash != ?
         ORDER BY last_seen DESC LIMIT 1`,
      )
        .bind(ipHash)
        .first();

      if (record) {
        const now = Date.now();
        await env.DB.prepare(
          `INSERT INTO visitors (ip_hash, city, region, country, first_seen, last_seen, visits)
           VALUES (?1, ?2, ?3, ?4, ?5, ?5, 1)
           ON CONFLICT(ip_hash) DO UPDATE SET
             last_seen = ?5,
             visits = visits + 1,
             city = ?2,
             region = ?3,
             country = ?4`,
        )
          .bind(ipHash, city, region, country, now)
          .run();
      }

      const [countRes, citiesRes, countriesRes, totalsRes] = await env.DB.batch([
        env.DB.prepare("SELECT COUNT(*) AS n FROM visitors"),
        env.DB.prepare(
          `SELECT city, country, COUNT(*) AS n FROM visitors
           WHERE city != 'Unknown'
           GROUP BY city, country
           ORDER BY n DESC, city ASC
           LIMIT 12`,
        ),
        env.DB.prepare(
          `SELECT country, COUNT(*) AS n FROM visitors
           WHERE country != 'XX'
           GROUP BY country
           ORDER BY n DESC
           LIMIT 12`,
        ),
        env.DB.prepare("SELECT COALESCE(SUM(visits), 0) AS v FROM visitors"),
      ]);

      return json({
        you: { city, region, country },
        lastVisitor: lastRow
          ? {
              city: lastRow.city,
              region: lastRow.region,
              country: lastRow.country,
              at: lastRow.last_seen,
            }
          : null,
        uniqueVisitors: countRes.results[0].n,
        totalVisits: totalsRes.results[0].v,
        topCities: citiesRes.results,
        topCountries: countriesRes.results,
      });
    } catch (err) {
      return json(
        { error: "analytics_failed", message: String(err?.message || err) },
        500,
      );
    }
  },
};
