# Glossy Home — Mobile Editable Starter Bundle

## Included
- `web-app/index.html`: mobile-ready frontend based on the supplied Property Rent Manager HTML, now with Admin Login and cloud sync client.
- `web-app/property-rent-manager-original.html`: preserved untouched original source.
- `cloudflare-worker/`: Cloudflare Worker API, static assets, Admin ID/password authentication, signed 12-hour token, Neon state sync, and deployment configuration.
- `neon-schema.sql`: additive Neon schema (creates one new table only).
- `android-project/GlossyHomeAndroid/`: Android Studio WebView project supplied by the user.
- `FORMULAS-AND-FEATURES.md`, `SAFETY-NOTES.md`, `DEPLOY-CHECKLIST-BN.md`.

## Implemented in the code bundle
- Server-side Admin ID/password verification using Cloudflare Worker secrets.
- Signed short-lived admin tokens.
- Authenticated read/write API for the full app state in Neon PostgreSQL.
- Frontend sign-in gate and cloud status/sync/logout controls.
- Local-first saves: existing localStorage remains and cloud sync follows after save.
- First cloud initialization is guarded: meaningful data on the current device is copied to an empty cloud; starter-only data requires explicit confirmation.
- Existing rent-manager forms, reports, exports, and formulas are retained from the supplied HTML source.

## Not yet completed
- No code has been deployed to the user's GitHub/Cloudflare/Neon accounts from this environment.
- Existing mobile data has not been read or migrated by this package.
- R2-based listing photo storage, conflict resolution across simultaneous devices, rate limiting, automated tests, and a production release review remain future hardening tasks.

See `DEPLOY-CHECKLIST-BN.md` before deployment. Do not commit real secrets or JSON data backups.


## Version 3: Premium Dashboard & Projects
- Dashboard now uses colourful, responsive flat cards with building name, room counts, monthly collection percentage, collected rent, rent balance and owner name.
- Tapping a flat card opens room-by-room tenant, rent, paid amount and balance details plus Wi-Fi, ADDC, Agent Commission, Maintenance, and total costs.
- Projects page groups flats by Building / Project Name and shows collection progress, building totals, owner names, owner monthly cost/rent, tenant rent, collected and outstanding balance.
- Existing localStorage key and data model remain compatible; new fields (`buildingName`, `ownerName`, `ownerRent`) are optional and old data is not automatically replaced.
- Existing flats must be assigned a Building / Project Name through Edit Flat to group correctly. The project page labels unassigned records rather than guessing which building they belong to.
