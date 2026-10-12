# Glossy Home — Final Starter Package (English UI)

## Included
- User-provided GlossyHome logo at `cloudflare-worker/public/logo.png` and `web-app/logo.png`.
- Mobile-friendly English UI with Dashboard flat cards and Projects grouping from v3.
- Cloudflare Worker API and Neon additive schema.
- Original HTML preserved at `web-app/property-rent-manager-original.html` and `web-app/property-rent-manager-backup.html`.
- Android Studio WebView project supplied in the earlier starter package.

## Important: not deployed yet
This ZIP has not been deployed to your GitHub, Cloudflare, or Neon account. Existing mobile data has not been copied into Neon. The current admin credentials must be configured as Cloudflare Worker secrets; do not commit passwords or `.dev.vars` to GitHub.

## Configure admin securely
In Cloudflare Worker settings / Secrets, configure `ADMIN_EMAIL` (or the variable name documented in `cloudflare-worker/src/index.ts`), `ADMIN_PASSWORD`, and `TOKEN_SECRET` according to the code. Use a unique strong password and change the password you shared in chat before production. Do not put real credentials in source code.

## Deploy sequence
1. Create a private GitHub repository and upload this folder's contents (not the ZIP itself, if you want Cloudflare Git integration).
2. Create a separate staging Cloudflare Worker / Pages target; do not replace the current live app yet.
3. Create a Neon database branch or database for staging; run `neon-schema.sql` only against staging first.
4. Set required Cloudflare secrets and database connection string. Check `DEPLOY-CHECKLIST-BN.md` and `cloudflare-worker/src/index.ts` for exact variable names and endpoints.
5. Run `npm install`, `npm run typecheck`, then `npm run dev` and test admin login, public view, edits, rent calculations, and cloud sync.
6. Migrate real data only after an export/backup is available and the schema mapping is verified.
7. Promote to production only after staging passes.

## Data and calculation caution
The UI's building/owner fields are optional. Existing flats must be assigned the correct building and owner; do not infer NMC/Ziyani assignments automatically. Financial totals depend on the records entered and must be compared with the current app before production.
