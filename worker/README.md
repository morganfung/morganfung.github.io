# Analytics Worker

A tiny Cloudflare Worker + D1 database that powers the **Analytics** tab on
[morganfung.com](https://morganfung.com). It counts **unique** visitors and
records the city/region/country each one came from.

## How it works

- **Geolocation is free and built in.** Cloudflare attaches the visitor's
  approximate city/region/country to every request (`request.cf`). No
  third-party IP-lookup API, no API key, nothing on the client.
- **Unique visitors, done privately.** The Worker hashes the visitor's IP with
  a secret salt (`IP_SALT`) and uses that hash as the primary key, so each
  person is counted once. **The raw IP is never stored** and can't be recovered
  from the hash.
- **Stats are SQL.** "Top cities", "top countries", "unique visitors", and
  "last visitor before you" are each a single query against D1 (SQLite).

## One-time setup (~5 minutes)

From this `worker/` directory:

```bash
npm install                      # installs wrangler locally
npx wrangler login               # opens browser to authorize your Cloudflare account
```

1. **Create the database:**

   ```bash
   npx wrangler d1 create morganfung-analytics
   ```

   Copy the printed `database_id` into `wrangler.toml` (replace
   `REPLACE_WITH_DATABASE_ID`).

2. **Create the table:**

   ```bash
   npm run init-db
   # = npx wrangler d1 execute morganfung-analytics --remote --file=schema.sql
   ```

3. **Set the IP salt secret** (any long random string):

   ```bash
   npx wrangler secret put IP_SALT
   ```

4. **Deploy:**

   ```bash
   npm run deploy
   ```

   Wrangler prints the live URL, e.g.
   `https://morganfung-analytics.<your-subdomain>.workers.dev`.

5. **Point the site at it.** Copy that URL into `src/lib/analytics.js`
   (replace `YOUR-SUBDOMAIN`), or set `VITE_ANALYTICS_URL` at build time. Then
   rebuild and publish the site as usual.

## Test it

```bash
# Read-only stats as JSON (does NOT record a visit):
curl https://morganfung-analytics.<your-subdomain>.workers.dev
```

To record a real visit, just open the site in a browser — `curl`/`wget` and
other non-browser user agents are treated as bots and skipped (see `BOT_RE`),
and geolocation only resolves on the deployed Worker, not on `localhost`.

## Notes & knobs

- **`ALLOWED_ORIGINS`** in `wrangler.toml` restricts which sites may call the
  Worker (CORS). Update it if your domain changes.
- **Bot filtering:** obvious crawlers/preview bots are ignored so the
  unique-visitor count stays honest (see `BOT_RE` in `src/index.js`).
- **Free tier:** Workers allow 100k requests/day and D1 5GB — far beyond a
  personal site's traffic.
- **Reset the data:** `npx wrangler d1 execute morganfung-analytics --remote
  --command "DELETE FROM visitors"`.
- **Privacy:** only hashed IPs and city-level geo are kept. If you ever want to
  honor Do Not Track, skip recording when the request sets `DNT: 1`.
