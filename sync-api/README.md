# Monochrome sync API (Next.js on Vercel)

Small API to store **library blob** (likes, history, user playlists, folders JSON) keyed by **Appwrite user id**, using **Vercel KV**.

The main Monochrome app today syncs via **PocketBase** (`js/accounts/pocketbase.js`). This service is a **standalone** backend you can deploy yourself; **wiring the desktop/web app to use it instead of PocketBase is not done yet** and would replace or branch that module.

## What it does

- `GET /api/health` — liveness + whether KV env is set.
- `GET /api/library` — requires `Authorization: Bearer <Appwrite JWT>` — returns JSON: `library`, `history`, `user_playlists`, `user_folders`.
- `POST /api/library` — same auth, body JSON with the same fields — saves the blob to KV.

JWT is validated by calling Appwrite `GET /v1/account` with headers `X-Appwrite-Project` and `X-Appwrite-JWT`.

**Client:** after login, create a JWT with the Appwrite web SDK: `await account.createJWT()` and send `jwt` in the `Authorization` header.

## Deploy on Vercel

1. Push this `sync-api` folder to a repo (or deploy as a subdirectory — set **Root Directory** to `sync-api` in Vercel).
2. In Vercel → **Storage** / **Marketplace** → add **Redis** (e.g. Upstash). Vercel injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or the Redis integration’s env vars — `@vercel/kv` reads the same KV-style variables when linked). Legacy “Vercel KV” was merged into Redis integrations; new projects should use Redis from the marketplace.
3. In **Settings → Environment Variables**, set:
   - `APPWRITE_ENDPOINT` — e.g. `https://sfo.cloud.appwrite.io/v1`
   - `APPWRITE_PROJECT_ID` — your project id
4. Deploy. Open `/api/health` — `kv` should be `vercel-kv` in production.

## Local dev

```bash
cd sync-api
npm install
cp .env.example .env.local
# fill APPWRITE_* ; optional: KV from Vercel CLI `vercel env pull`
npm run dev
```

Without KV, data is stored **in memory** (dev only, lost on restart).

## Integration with Monochrome (future)

To use this API from the app, you would:

1. After `authManager` login, call `account.createJWT()` (from `js/lib/appwrite.js` export `account` or `auth`).
2. `fetch('https://your-api.vercel.app/api/library', { headers: { Authorization: `Bearer ${jwt}` } })`.
3. Replace or extend `syncManager` in `pocketbase.js` to read/write this API instead of PocketBase.

Until then, your **likes still sync** to the default PocketBase URL in settings, or stay local-only in IndexedDB.
