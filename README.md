# Glossy Home Property Rent Manager — Final Package

Phone-first property rent dashboard. The public view is read-only; only an authenticated Admin can change data. Cloudflare Worker serves the app and API; Neon stores the shared app state.

## Before deployment
1. Configure Cloudflare Worker secrets: `DATABASE_URL`, `ADMIN_ID`, `ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET` (at least 32 characters). Never commit real secrets.
2. Run `neon-schema.sql` once in the intended Neon database.
3. From `cloudflare-worker`, run `npm install`, `npm run typecheck`, then `npm run deploy`.
4. Check `/api/health`, then `/api/v1/public-data`. If no cloud row exists, sign in as Admin on the device containing the authoritative records and initialize the first cloud copy.
5. Keep a downloaded JSON backup before choosing any cloud/device conflict resolution.

## Important data note
The 9 own-flat labels and example rents in this package are starter defaults only. Actual collection percentages are calculated from recorded payments; blank building owner/rent fields are not treated as real income. Existing localStorage data is retained and normalized rather than reset.

## Exports
Monthly report HTML and print-to-PDF are supported. Direct JPG export depends on browser capture support; use a device screenshot if direct capture is unavailable.
