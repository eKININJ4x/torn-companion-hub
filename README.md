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

When releasing a new TC OC version, update this hosted copy from `eKININJ4x/torn-oc-utility-manager` along with the hub release. Preserve the canonical update/download metadata in the script.
