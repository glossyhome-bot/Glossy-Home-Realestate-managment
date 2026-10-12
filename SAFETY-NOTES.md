# Safety Notes

- The original supplied HTML is preserved as `web-app/property-rent-manager-original.html` and its previous backup copy remains in the bundle.
- The Android source project is included separately.
- The app's current localStorage key is `propertyRentManager_v1`; local browser/WebView data is not included in this ZIP.
- Cloud initialization is not automatic when the local device appears to contain only the starter template. Confirm the correct source device before initializing an empty cloud database.
- The API protects remote writes with server-side auth. Keep `DATABASE_URL`, `ADMIN_PASSWORD`, and `ADMIN_TOKEN_SECRET` in Cloudflare secrets only.
- Neon schema is additive; it creates `glossy_home_app_state` and does not drop or rewrite existing tables.
- Do not uninstall the current app, clear app storage, or replace production until the correct source device and cloud data are verified.
