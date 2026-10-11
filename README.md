# Torn Companion Hub

Public landing page for Torn Companion community tools.

## Deployment

This repository is designed for Cloudflare Workers static asset deployment.

- Production branch: `main`
- Deploy command: `npx wrangler deploy`
- Static asset directory: `./public`

Pushes to `main` can be deployed automatically by Cloudflare.

## Included tools

- OC Utility Manager
- Education Companion
- Faction Armory Tracker
- Ranked War & Payout

More tools can be added to the Hub over time.

## Torn PDA installation

The hub serves the canonical TC OC userscript at `/scripts/tc-oc.user.js` with `text/javascript` headers for Torn PDA installation. Open the hub in Torn PDA and use the install button, then confirm in the app. Desktop installation and copy/paste fallback remain available.

The Sync TC OC installer workflow checks the canonical repository hourly and can also be run manually. It mirrors only a newer version after header, faction match and JavaScript syntax validation. Update/download metadata remains canonical. A successful sync pushes the new installer to main for the existing Cloudflare deployment integration.

## Stable releases and feedback

The current stable hub version is recorded in `release-version.txt`; see `CHANGELOG.md`. The stable-release workflow publishes a GitHub release and tag for that recorded version without replacing existing releases. Hub versions are independent of Education and TC OC versions.

Use the hub footer to report bugs or suggest features. Review and reproduce reports before planning the next feature batch; no new feature commitments are made in this release.
