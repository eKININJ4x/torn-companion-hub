# Torn Companion — Background Item Market Watcher (pilot)

This is an **isolated pilot Worker**, not a deployed service. It does not change the existing public hub or its browser-based monitoring.

## Cloudflare setup (required before deployment)

1. Create a Cloudflare KV namespace named `tc-market-watch-state` and insert its actual ID into this directory's `wrangler.jsonc` as `WATCH_STATE`.
2. In a new Cloudflare Worker using this directory's configuration, provision three **secrets**: `TORN_API_KEY` (your own consented public/limited Torn key), `DISCORD_WEBHOOK_URL` (a webhook for a channel you control), and `ADMIN_TOKEN` (a long random secret used to manage the watchlist). Never put these into GitHub or plaintext config. If the Discord webhook leaks, regenerate it.
3. Deploy **the background Worker separately**, so the existing hub is unaffected. Configure Cron Triggers once every minute as shown in Wrangler. Check Cloudflare's plan limits and Worker logs.
4. Set the private watchlist by making an authenticated `PUT /admin/watchlist` request with JSON such as `[{"id":1118,"target":320000000},{"id":206,"target":875000}]`. Provide `Authorization: Bearer <ADMIN_TOKEN>`. Each ID has an individually confirmed target. Only items in this watchlist are checked. Maximum 20 items per run for this initial pilot.
5. Confirm `GET /health` reports ready, verify the Worker logs for market checks, then use a deliberately qualifying price to confirm Discord receives an alert. Restore your real target afterwards.

## Security and operating notes

- Keys and webhooks are stored as Cloudflare secrets, not in the browser or GitHub. Only the administrator can change the pilot watchlist; no account synchronization exists yet.
- Do not copy a visitor's hub API key into this service without explicit consent and a clear Torn API terms notice. Multi-user background monitoring needs authenticated per-user enrollment and secure isolated credential storage.
- The Cron Worker sends notifications only and **does not buy items**. It honours Torn's globally cached market listings, so prices are snapshots and a listing can disappear before a user clicks.
- The Worker sends one Discord alert per item/target until the lowest price rises above target. KV operations are eventually consistent; extremely close overlapping runs could produce duplicates.
- If Discord fails after a qualifying check, the alert is suppressed until the listing becomes ineligible and then eligible again. Review logs for webhook errors; retry handling can be added after the pilot is proven.
- Changing a watch price through the current web UI **does not update** this pilot's server-side watchlist yet. Browser-only alerts remain independent.
- Torn recommends minimal API requests and permits a maximum of 100 requests per minute per user key (subject to change). This pilot checks at most 20 items once a minute. Verify current Torn API terms before enabling wider distribution.

## Next stage

Create secure user authentication and explicit opt-in settings to sync confirmed favourites and thresholds into server-side storage. Then provide per-user destination settings for Discord notifications. Do not publish an unauthenticated endpoint that accepts watchlists or secrets.
