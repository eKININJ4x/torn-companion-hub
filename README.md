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

## OC Requirement Display

The hub card at `/#oc-requirements` installs the public userscript for Tampermonkey or Torn PDA. Version 3.3.0 adds a compact settings panel on Torn with crime-wide and role-specific target overrides saved locally between reloads and script updates. The userscript and metadata-only file are hosted under `public/scripts/tc-oc-requirements.*.js`. The update URLs point to these files on the repository's main branch. No API key is required.

The catalogue covers 33 crimes. Existing custom targets remain; newly added crimes default to 60. These are faction targets, not official Torn minimums. Change the version in both files together for future releases. Desktop and PDA installation, duplicate-script handling and manual-copy fallback are documented on the card.

### OC minimum settings (v3.3.0)

Open **TC · OC minimums** on Torn's faction crime page. Choose a crime, set an optional crime-wide minimum and optional individual role overrides, then select **Save targets**. Role overrides take precedence over the crime-wide value, which takes precedence over the built-in table. Blank values inherit the existing targets; unknown targets still use 60. Reset this crime and Reset all stage changes until Save is selected. Targets must be whole numbers from 0 to 100.

Settings are stored under the version-independent `tc.ocRequirementTargets.v1` key in Torn's local browser storage. They survive script updates and are separate for each browser/device and Torn origin. Clearing site data removes them. Storage and validation failures are shown in the panel. The script makes no API or network requests.

The hub groups scripts above webpages, uses distinct SVG artwork for each userscript and consistent desktop/PDA install buttons. Market Watcher is marked Live following user verification.
