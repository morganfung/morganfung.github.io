import { useEffect, useState } from "react";
import { loadAnalytics, refreshAnalytics, isConfigured } from "../lib/analytics";

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
  const tail = country ? countryName(country) : "";
  return [head, tail].filter(Boolean).join(" · ") || "Somewhere";
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
          <section className="section animate-in">
            <div className="meta-list">
              <div className="meta-row">
                <span className="meta-key">Unique visitors</span>
                <span className="meta-val mono">
                  {data.uniqueVisitors.toLocaleString()}
                </span>
              </div>
              {data.lastVisitor && (
                <div className="meta-row">
                  <span className="meta-key">Last visitor</span>
                  <span className="meta-val">
                    {place(data.lastVisitor)}
                    {data.lastVisitor.at ? ` · ${timeAgo(data.lastVisitor.at)}` : ""}
                  </span>
                </div>
              )}
              {data.you && (
                <div className="meta-row">
                  <span className="meta-key">You’re visiting from</span>
                  <span className="meta-val">{place(data.you)}</span>
                </div>
              )}
            </div>
          </section>

          {data.topCities?.length > 0 && (
            <section className="section animate-in">
              <h2 className="section-title">Top cities</h2>
              <div className="meta-list">
                {data.topCities.map((c) => (
                  <div className="meta-row" key={`${c.city}-${c.country}`}>
                    <span className="meta-key">
                      {c.city}
                      <span className="meta-sub">{countryName(c.country)}</span>
                    </span>
                    <span className="meta-val mono">{c.n}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.topCountries?.length > 0 && (
            <section className="section animate-in">
              <h2 className="section-title">Top countries</h2>
              <div className="meta-list">
                {data.topCountries.map((c) => (
                  <div className="meta-row" key={c.country}>
                    <span className="meta-key">{countryName(c.country)}</span>
                    <span className="meta-val mono">{c.n}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="section animate-in">
            <button
              className="text-link"
              onClick={onRefresh}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <p className="analytics-note">
              Geolocation is approximate and comes from Cloudflare’s edge. IP
              addresses are hashed and never stored.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
