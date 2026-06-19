import { useEffect, useState } from "react";
import { loadAnalytics, refreshAnalytics, isConfigured } from "../lib/analytics";

// ISO 3166 alpha-2 code -> flag emoji (regional indicator symbols).
function flag(cc) {
  if (!cc || cc.length !== 2) return "";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    ...[...cc.toUpperCase()].map((c) => base + c.charCodeAt(0) - 65),
  );
}

const regionNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function countryName(cc) {
  if (!cc) return "";
  try {
    return (regionNames && regionNames.of(cc)) || cc;
  } catch {
    return cc;
  }
}

function timeAgo(ts) {
  if (!ts) return "";
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function place({ city, region, country }) {
  const parts = [];
  if (city && city !== "Unknown") parts.push(city);
  if (region && region !== city) parts.push(region);
  const head = parts.join(", ");
  const tail = country ? `${flag(country)} ${countryName(country)}`.trim() : "";
  return [head, tail].filter(Boolean).join(" · ") || "Somewhere";
}

function GeoList({ items }) {
  const max = Math.max(...items.map((i) => i.n), 1);
  return (
    <div className="geo-list">
      {items.map((i) => (
        <div className="geo-item" key={i.key}>
          <span className="geo-label">
            {i.label}
            {i.sub ? <span className="geo-sub"> {i.sub}</span> : null}
          </span>
          <span className="geo-track">
            <span className="geo-bar" style={{ width: `${(i.n / max) * 100}%` }} />
          </span>
          <span className="geo-count">{i.n}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isConfigured) return;
    let alive = true;
    loadAnalytics()
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    try {
      setData(await refreshAnalytics());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <main>
      <div className="hero animate-in">
        <h1>Analytics</h1>
        <p className="subtitle">Where visitors to this site come from.</p>
      </div>

      {!isConfigured ? (
        <section className="section animate-in">
          <p className="empty-state">
            Analytics backend isn’t configured yet — see{" "}
            <code>worker/README.md</code>.
          </p>
        </section>
      ) : error ? (
        <section className="section animate-in">
          <p className="empty-state">Couldn’t load analytics right now.</p>
        </section>
      ) : !data ? (
        <section className="section animate-in">
          <p className="empty-state">Loading…</p>
        </section>
      ) : (
        <>
          {data.you && (
            <section className="section animate-in">
              <div className="analytics-you">
                <span className="analytics-you-label">You’re visiting from</span>
                <span className="analytics-you-place">{place(data.you)}</span>
              </div>
            </section>
          )}

          <section className="section animate-in">
            <div className="stat-grid">
              <div className="stat">
                <span className="stat-num">
                  {data.uniqueVisitors.toLocaleString()}
                </span>
                <span className="stat-label">unique visitors</span>
              </div>
              {data.lastVisitor && (
                <div className="stat">
                  <span className="stat-num stat-num-sm">
                    {place(data.lastVisitor)}
                  </span>
                  <span className="stat-label">
                    last visitor before you
                    {data.lastVisitor.at ? ` · ${timeAgo(data.lastVisitor.at)}` : ""}
                  </span>
                </div>
              )}
            </div>
          </section>

          {data.topCities?.length > 0 && (
            <section className="section animate-in">
              <h2 className="section-title">Top cities</h2>
              <GeoList
                items={data.topCities.map((c) => ({
                  key: `${c.city}-${c.country}`,
                  label: `${flag(c.country)} ${c.city}`,
                  sub: countryName(c.country),
                  n: c.n,
                }))}
              />
            </section>
          )}

          {data.topCountries?.length > 0 && (
            <section className="section animate-in">
              <h2 className="section-title">Top countries</h2>
              <GeoList
                items={data.topCountries.map((c) => ({
                  key: c.country,
                  label: `${flag(c.country)} ${countryName(c.country)}`,
                  n: c.n,
                }))}
              />
            </section>
          )}

          <section className="section animate-in">
            <button
              className="analytics-refresh"
              onClick={onRefresh}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <p className="analytics-note">
              Geolocation is approximate (city-level) and comes from Cloudflare’s
              edge. IP addresses are hashed and never stored.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
